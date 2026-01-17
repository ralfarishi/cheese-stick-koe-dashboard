import type { ClassValue } from "clsx";
import type {
	ingredient,
	ingredientHistory,
	product,
	productSizePrice,
	sizeComponent,
	invoice,
	invoiceItem,
	rateLimit,
} from "@/db/schema";

// ============================================================================
// Drizzle-inferred Entity Types
// ============================================================================

/** Ingredient entity type */
export type Ingredient = typeof ingredient.$inferSelect;
export type NewIngredient = typeof ingredient.$inferInsert;

/** Ingredient history entity type */
export type IngredientHistory = typeof ingredientHistory.$inferSelect;
export type NewIngredientHistory = typeof ingredientHistory.$inferInsert;

/** Product entity type */
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;

/** Product size price entity type */
export type ProductSizePrice = typeof productSizePrice.$inferSelect;
export type NewProductSizePrice = typeof productSizePrice.$inferInsert;

/** Size component entity type */
export type SizeComponent = typeof sizeComponent.$inferSelect;
export type NewSizeComponent = typeof sizeComponent.$inferInsert;

/** Invoice entity type */
export type Invoice = typeof invoice.$inferSelect;
export type NewInvoice = typeof invoice.$inferInsert;

/** Invoice item entity type */
export type InvoiceItem = typeof invoiceItem.$inferSelect;
export type NewInvoiceItem = typeof invoiceItem.$inferInsert;

/** Rate limit entity type */
export type RateLimit = typeof rateLimit.$inferSelect;
export type NewRateLimit = typeof rateLimit.$inferInsert;

// ============================================================================
// Common Types
// ============================================================================

/** Invoice status options */
export type InvoiceStatus = "pending" | "success" | "canceled";

/** Sort order direction */
export type SortOrder = "asc" | "desc";

/** Discount mode for invoice items */
export type DiscountMode = "percent" | "amount";

// ============================================================================
// Action Result Types
// ============================================================================

/** Generic action result type */
export type ActionResult<T = unknown> =
	| { success: true; data: T; error?: never }
	| { success?: false; data?: never; error: string };

/** Paginated result type */
export interface PaginatedResult<T> {
	data: T[];
	error: string | null;
	count: number;
	totalPages: number;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface IngredientInput {
	name: string;
	unit: string;
	costPerUnit: string | number;
}

export interface ProductInput {
	name: string;
	description?: string;
}

export interface SizePriceInput {
	size: string;
	price: string | number;
	laborPercent?: string | number;
}

export interface InvoiceItemInput {
	productId: string;
	sizePriceId: string;
	quantity: number;
	subtotal: number;
	discountAmount?: number;
	costPerItem?: number;
	totalCost?: number;
}

export interface InvoiceInput {
	buyerName: string;
	invoiceNumber: string;
	invoiceDate: Date | string;
	shipping: number;
	discount?: number;
	items: InvoiceItemInput[];
}

// ============================================================================
// Component Props Types
// ============================================================================

/** Props for className utility */
export type ClassNameValue = ClassValue;

/** Common modal props */
export interface ModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Pagination props */
export interface PaginationParams {
	page?: number;
	limit?: number;
	query?: string;
	sortBy?: string;
	sortOrder?: SortOrder;
}

// ============================================================================
// Extended Entity Types (with relations)
// ============================================================================

/** Invoice item with related product info */
/** Invoice item with related product info */
export interface InvoiceItemWithProduct extends InvoiceItem {
	product?: Partial<Product> | { id: string; name: string };
	sizePrice?: Partial<ProductSizePrice> | { id: string; size: string; price: number };
}

/** Invoice with items */
export interface InvoiceWithItems extends Invoice {
	items: InvoiceItemWithProduct[];
}

/** Size component with ingredient info */
export interface SizeComponentWithIngredient extends SizeComponent {
	ingredient?: Ingredient;
}

// ============================================================================
// Extended Modal Props Types
// ============================================================================

/** Modal props with optional success callback */
export interface ModalPropsWithSuccess extends ModalProps {
	onSuccess?: () => void;
}

/** Modal props with optional cancel button */
export interface ModalPropsExtended extends ModalPropsWithSuccess {
	showCancel?: boolean;
}

// ============================================================================
// Invoice Form Types
// ============================================================================

/** Invoice form item type for edit form state */
export interface InvoiceFormItem {
	productId: string;
	sizePriceId: string;
	quantity: number;
	price: number;
	discountAmount: number;
	discountInput: string;
	discountMode: DiscountMode;
	costPerItem?: number;
	totalCost?: number;
	total: number;
}

/** Invoice form values for react-hook-form */
export interface InvoiceFormValues {
	invoiceNumber: string;
	buyerName: string;
	shippingPrice: number;
}

/** Props for useInvoiceForm hook */
export interface UseInvoiceFormProps {
	invoice: InvoiceWithItems;
	sizesData?: ProductSizePrice[];
}

// ============================================================================
// Size Component Types
// ============================================================================

/** Component with calculated cost */
export interface ComponentWithCost {
	id: string;
	ingredientId: string;
	quantity: number;
	ingredientName: string;
	ingredientUnit: string;
	ingredientCost: number;
	totalCost: number;
}

// ============================================================================
// Table Ref Types
// ============================================================================

/** Ref type for tables with refresh functionality */
export interface TableRef {
	refresh: () => void;
}

// ============================================================================
// Size Price Input Types
// ============================================================================

/** Input type for updating size prices */
export interface SizeUpdateInput {
	size: string;
	price: string | number;
	laborPercent: string | number;
}
