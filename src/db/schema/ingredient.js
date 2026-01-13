import {
	pgTable,
	uuid,
	text,
	timestamp,
	doublePrecision,
	unique,
	index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Ingredient table - master data for ingredients/utilities
 */
export const ingredient = pgTable("Ingredient", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	unit: text("unit").notNull(), // e.g., "gr", "ml", "pcs", "use"
	costPerUnit: doublePrecision("costPerUnit").notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * SizeComponent table - recipe bridge connecting SizePrice to Ingredients
 */
export const sizeComponent = pgTable(
	"SizeComponent",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		sizePriceId: uuid("sizePriceId").notNull(),
		ingredientId: uuid("ingredientId").notNull(),
		quantityNeeded: doublePrecision("quantityNeeded").notNull(),
	},
	(table) => [
		// Prevent duplicate ingredient entries per size
		unique("SizeComponent_sizePriceId_ingredientId_key").on(table.sizePriceId, table.ingredientId),
	]
);

/**
 * IngredientHistory table - price history tracker (audit log)
 */
export const ingredientHistory = pgTable(
	"IngredientHistory",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		ingredientId: uuid("ingredientId").notNull(),
		oldPrice: doublePrecision("oldPrice").notNull(),
		newPrice: doublePrecision("newPrice").notNull(),
		reason: text("reason"), // Optional commit message for the price change
		changedAt: timestamp("changedAt", { mode: "date" }).defaultNow().notNull(),
	},
	(table) => [
		// Index for efficient history lookup
		index("IngredientHistory_ingredientId_changedAt_idx").on(table.ingredientId, table.changedAt),
	]
);

// Relations
export const ingredientRelations = relations(ingredient, ({ many }) => ({
	components: many(sizeComponent),
	history: many(ingredientHistory),
}));

export const sizeComponentRelations = relations(sizeComponent, ({ one }) => ({
	sizePrice: one(productSizePrice, {
		fields: [sizeComponent.sizePriceId],
		references: [productSizePrice.id],
	}),
	ingredient: one(ingredient, {
		fields: [sizeComponent.ingredientId],
		references: [ingredient.id],
	}),
}));

export const ingredientHistoryRelations = relations(ingredientHistory, ({ one }) => ({
	ingredient: one(ingredient, {
		fields: [ingredientHistory.ingredientId],
		references: [ingredient.id],
	}),
}));

// Forward import for cross-file relations
import { productSizePrice } from "./product.js";
