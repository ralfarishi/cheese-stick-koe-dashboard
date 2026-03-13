import { z } from "zod";

const uuidSchema = z.string().uuid({ error: "Invalid UUID format" });

const trimmedString = (label: string, maxLength: number) =>
	z
		.string()
		.trim()
		.min(1, { error: `${label} is required` })
		.max(maxLength, { error: `${label} is too long (max ${maxLength} characters)` });

const positiveInt = (label: string) =>
	z.coerce
		.number({
			error: (issue) =>
				issue.input === undefined ? `${label} is required` : `${label} must be a number`,
		})
		.int()
		.min(0, { error: `${label} must be non-negative` });

const positiveFloat = (label: string) =>
	z.coerce
		.number({
			error: (issue) =>
				issue.input === undefined ? `${label} is required` : `${label} must be a number`,
		})
		.min(0, { error: `${label} must be non-negative` });

// ============================================================================
// Invoice Schemas
// ============================================================================

export const invoiceItemSchema = z.object({
	productId: uuidSchema,
	sizePriceId: uuidSchema,
	quantity: z.coerce.number().int().min(1, { error: "Quantity must be at least 1" }),
	subtotal: z.coerce.number().int().min(0),
	discountAmount: z.coerce.number().int().min(0).default(0),
});

export const submitInvoiceSchema = z.object({
	invoiceNumber: trimmedString("Invoice number", 100),
	buyerName: trimmedString("Buyer name", 255),
	invoiceDate: z.coerce.date({
		error: "Invalid invoice date",
	}),
	shippingPrice: positiveInt("Shipping price"),
	discountAmount: positiveInt("Discount amount").default(0),
	totalPrice: positiveInt("Total price"),
	items: z.array(invoiceItemSchema).min(1, { error: "At least one item is required" }),
});

export type SubmitInvoiceInput = z.infer<typeof submitInvoiceSchema>;

const INVOICE_STATUSES = ["pending", "success", "canceled"] as const;

const invoiceStatusSchema = z.enum(INVOICE_STATUSES, {
	error: "Status must be one of: pending, success, canceled",
});

export const updateInvoiceStatusSchema = z.object({
	invoiceId: uuidSchema,
	status: invoiceStatusSchema,
});

export const updateInvoiceDataSchema = z.object({
	invoiceNumber: trimmedString("Invoice number", 100),
	buyerName: trimmedString("Buyer name", 255),
	invoiceDate: z.coerce.date(),
	shipping: positiveInt("Shipping"),
	discount: positiveInt("Discount"),
	totalPrice: positiveInt("Total price"),
	status: invoiceStatusSchema,
});

export const updateInvoiceItemSchema = z.object({
	productId: uuidSchema,
	sizePriceId: uuidSchema,
	quantity: z.coerce.number().int().min(1),
	price: z.coerce.number().int().min(0).optional(),
	discountAmount: z.coerce.number().int().min(0).optional(),
});

export const updateInvoiceSchema = z.object({
	invoiceId: uuidSchema,
	invoiceData: updateInvoiceDataSchema,
	items: z.array(updateInvoiceItemSchema).min(1),
});

// ============================================================================
// Ingredient Schemas
// ============================================================================

export const addIngredientSchema = z.object({
	name: trimmedString("Ingredient name", 255),
	unit: trimmedString("Unit", 50),
	costPerUnit: positiveFloat("Cost per unit"),
});

export const updateIngredientPriceSchema = z.object({
	id: uuidSchema,
	newPrice: positiveFloat("New price"),
	reason: z.string().trim().max(500).optional().nullable(),
});

// ============================================================================
// Product Schemas
// ============================================================================

export const addProductSchema = z.object({
	name: trimmedString("Product name", 100),
	description: z.string().trim().max(500).optional().nullable(),
});

// ============================================================================
// Size Price Schemas
// ============================================================================

export const addSizeSchema = z.object({
	size: trimmedString("Size", 50),
	price: positiveInt("Price"),
	laborPercent: positiveInt("Labor percent").default(0),
});

// ============================================================================
// Pagination Schema
// ============================================================================

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	query: z.string().trim().max(255).default(""),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
	sortBy: z.string().trim().max(50).optional(),
});

export const idSchema = z.object({
	id: uuidSchema,
});

