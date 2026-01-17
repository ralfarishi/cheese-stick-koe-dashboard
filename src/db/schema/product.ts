import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Product table - stores product catalog information
 */
export const product = pgTable("Product", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text("name").unique().notNull(),
	description: text("description"),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * ProductSizePrice table - stores size and pricing variants for products
 */
export const productSizePrice = pgTable("ProductSizePrice", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	size: text("size").unique().notNull(),
	price: integer("price").notNull(),
	laborPercent: integer("laborPercent").default(0).notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const productRelations = relations(product, ({ many }) => ({
	sizePrices: many(productSizePrice),
}));
