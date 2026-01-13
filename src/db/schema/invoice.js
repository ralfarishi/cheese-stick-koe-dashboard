import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Invoice table - stores invoice header information
 */
export const invoice = pgTable("Invoice", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	invoiceNumber: text("invoiceNumber").unique().notNull(),
	buyerName: text("buyerName").notNull(),
	shipping: integer("shipping").notNull(),
	totalPrice: integer("totalPrice").notNull(),
	invoiceDate: timestamp("invoiceDate", { withTimezone: true, mode: "date" }).notNull(),
	status: text("status").notNull(),
	userId: uuid("userId").notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
	discount: integer("discount").default(0).notNull(),
});

/**
 * InvoiceItem table - stores individual line items for each invoice
 */
export const invoiceItem = pgTable("InvoiceItem", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	invoiceId: uuid("invoiceId").notNull(),
	productId: uuid("productId").notNull(),
	sizePriceId: uuid("sizePriceId").notNull(),
	quantity: integer("quantity").notNull(),
	subtotal: integer("subtotal").notNull(),
	discountAmount: integer("discountAmount").default(0).notNull(),
	costPerItem: integer("costPerItem").default(0).notNull(),
	totalCost: integer("totalCost").default(0).notNull(),
});

// Relations for relational queries
export const invoiceRelations = relations(invoice, ({ many }) => ({
	items: many(invoiceItem),
}));

export const invoiceItemRelations = relations(invoiceItem, ({ one }) => ({
	invoice: one(invoice, {
		fields: [invoiceItem.invoiceId],
		references: [invoice.id],
	}),
}));
