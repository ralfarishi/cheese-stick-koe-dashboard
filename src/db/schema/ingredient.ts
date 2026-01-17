import { pgTable, uuid, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Ingredient table - stores ingredient information for cost tracking
 */
export const ingredient = pgTable("Ingredient", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text("name").unique().notNull(),
	unit: text("unit").notNull(),
	costPerUnit: real("costPerUnit").notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * IngredientHistory table - tracks price changes for ingredients
 */
export const ingredientHistory = pgTable("IngredientHistory", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	ingredientId: uuid("ingredientId").notNull(),
	oldPrice: real("oldPrice").notNull(),
	newPrice: real("newPrice").notNull(),
	reason: text("reason"),
	changedAt: timestamp("changedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * SizeComponent table - maps ingredients to product sizes with quantities
 */
export const sizeComponent = pgTable("SizeComponent", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	sizePriceId: uuid("sizePriceId").notNull(),
	ingredientId: uuid("ingredientId").notNull(),
	quantityNeeded: real("quantityNeeded").notNull(),
});

// Relations
export const ingredientRelations = relations(ingredient, ({ many }) => ({
	history: many(ingredientHistory),
	sizeComponents: many(sizeComponent),
}));

export const ingredientHistoryRelations = relations(ingredientHistory, ({ one }) => ({
	ingredient: one(ingredient, {
		fields: [ingredientHistory.ingredientId],
		references: [ingredient.id],
	}),
}));

export const sizeComponentRelations = relations(sizeComponent, ({ one }) => ({
	ingredient: one(ingredient, {
		fields: [sizeComponent.ingredientId],
		references: [ingredient.id],
	}),
}));
