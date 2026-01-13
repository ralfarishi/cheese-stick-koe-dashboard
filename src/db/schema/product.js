import { pgTable, uuid, text, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Product table - stores product information
 */
export const product = pgTable("Product", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * ProductSizePrice table - stores size variants and their prices
 */
export const productSizePrice = pgTable("ProductSizePrice", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	size: text("size").notNull(),
	price: integer("price").notNull(),
	laborPercent: doublePrecision("laborPercent").default(0).notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const productRelations = relations(product, ({ many }) => ({
	invoiceItems: many(invoiceItem),
}));

export const productSizePriceRelations = relations(productSizePrice, ({ many }) => ({
	invoiceItems: many(invoiceItem),
	components: many(sizeComponent),
}));

// Forward imports for cross-file relations
import { invoiceItem } from "./invoice.js";
import { sizeComponent } from "./ingredient.js";
