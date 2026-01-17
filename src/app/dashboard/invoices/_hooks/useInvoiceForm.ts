import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { Invoice, InvoiceStatus, DiscountMode } from "@/lib/types";
import { updateInvoice } from "@/lib/actions/invoice/updateInvoice";
import { calculateDiscountAmount } from "@/lib/utils";

export interface InvoiceFormItem {
	productId: string;
	sizePriceId: string;
	quantity: number;
	price: number;
	discountAmount: number;
	costPerItem: number;
	totalCost: number;
	discountInput: string;
	discountMode: DiscountMode;
	total: number;
}

export interface InvoiceFormValues {
	invoiceNumber: string;
	buyerName: string;
	shippingPrice: number;
}

// Base interface for size compatibility
interface SizeBase {
	id: string;
	size: string;
	price: number;
}

export interface UseInvoiceFormProps {
	invoice: Invoice & {
		items?: Array<{
			productId: string;
			sizePriceId: string;
			quantity: number;
			discountAmount: number;
			costPerItem: number;
			totalCost: number;
			sizePrice?: { price?: number };
		}>;
	};
	sizesData?: SizeBase[];
}

type UpdateStatus = "loading" | "success" | null;

export interface UseInvoiceFormReturn {
	form: UseFormReturn<InvoiceFormValues>;
	isPending: boolean;
	updateStatus: UpdateStatus;
	items: InvoiceFormItem[];
	invoiceDate: string;
	setInvoiceDate: (date: string) => void;
	status: InvoiceStatus;
	setStatus: (status: InvoiceStatus) => void;
	shippingPrice: number;
	setShippingPrice: (price: number) => void;
	discountMode: DiscountMode;
	discountInput: string;
	discountAmount: number;
	discountPercent: number;
	handleDiscountChange: (mode: DiscountMode, value: string) => void;
	subtotal: number;
	totalPrice: number;
	handleItemChange: (
		index: number,
		field: string,
		value: string | number,
		mode?: DiscountMode | null
	) => void;
	addItem: () => void;
	removeItem: (index: number) => void;
	onSubmit: (data: InvoiceFormValues) => Promise<void>;
}

/**
 * useInvoiceForm - Custom hook for invoice form state and logic
 */
export function useInvoiceForm({
	invoice,
	sizesData = [],
}: UseInvoiceFormProps): UseInvoiceFormReturn {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(null);

	const [sizes] = useState<SizeBase[]>(sizesData);

	// Handle Date objects from Drizzle
	const invoiceDateStr =
		invoice.invoiceDate instanceof Date
			? invoice.invoiceDate.toISOString()
			: String(invoice.invoiceDate || "");
	const [invoiceDate, setInvoiceDate] = useState<string>(invoiceDateStr.split("T")[0] || "");
	const [invoiceTime] = useState<string>(invoiceDateStr.split("T")[1] || "00:00:00.000Z");

	const [items, setItems] = useState<InvoiceFormItem[]>([]);
	const [shippingPrice, setShippingPrice] = useState<number>(invoice.shipping || 0);
	const [status, setStatus] = useState<InvoiceStatus>(
		(invoice.status as InvoiceStatus) || "pending"
	);

	const [discountMode, setDiscountMode] = useState<DiscountMode>("amount");
	const [discountInput, setDiscountInput] = useState<string>("0");

	const form = useForm<InvoiceFormValues>({
		defaultValues: {
			invoiceNumber: invoice.invoiceNumber || "",
			buyerName: invoice.buyerName || "",
			shippingPrice: invoice.shipping || 0,
		},
		mode: "onChange",
	});

	// Initialize items from invoice
	useEffect(() => {
		if (invoice?.items?.length) {
			const mappedItems: InvoiceFormItem[] = invoice.items.map((item) => {
				const quantity = item.quantity || 0;
				const price = item.sizePrice?.price || 0;
				const subtotal = quantity * price;
				const discountAmount = item.discountAmount || 0;

				return {
					productId: item.productId,
					sizePriceId: item.sizePriceId,
					quantity,
					price,
					discountAmount,
					costPerItem: item.costPerItem || 0,
					totalCost: item.totalCost || 0,
					discountInput: String(discountAmount),
					discountMode: "amount" as DiscountMode,
					total: subtotal - discountAmount,
				};
			});

			setItems(mappedItems);
		}

		if (invoice?.discount !== undefined) {
			setDiscountInput(String(invoice.discount));
			setDiscountMode("amount");
		}
	}, [invoice]);

	// Calculate totals
	const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);

	// Calculate discount based on items total
	const discountAmount =
		discountMode === "percent"
			? Math.round(((parseFloat(discountInput) || 0) / 100) * itemsTotal)
			: parseInt(discountInput) || 0;

	const discountPercent =
		discountMode === "amount" && itemsTotal > 0
			? ((parseInt(discountInput) || 0) / itemsTotal) * 100
			: parseFloat(discountInput) || 0;

	// Subtotal = items total - general discount
	const subtotal = itemsTotal - discountAmount;

	// Total = Subtotal + Shipping
	const totalPrice = subtotal + (shippingPrice || 0);

	// Handlers
	const handleItemChange = useCallback(
		(
			index: number,
			field: string,
			value: string | number,
			mode: DiscountMode | null = null
		): void => {
			setItems((prevItems) => {
				const updatedItems = [...prevItems];
				const item = { ...updatedItems[index] };

				if (field === "sizePriceId") {
					const selectedSize = sizes.find((s) => s.id === value);
					item.sizePriceId = value as string;
					item.price = selectedSize?.price || 0;
				} else if (field === "quantity") {
					const parsed = parseInt(String(value), 10);
					item.quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
				} else if (field === "price") {
					const parsed = parseInt(String(value), 10);
					item.price = isNaN(parsed) ? 0 : parsed;
				} else if (field === "discountMode") {
					item.discountMode = value as DiscountMode;
				} else if (field === "discountInput") {
					item.discountInput = String(value);
					if (mode) item.discountMode = mode;
				} else if (field === "productId") {
					item.productId = value as string;
				}

				const qty = item.quantity || 0;
				const price = item.price || 0;
				const rawTotal = qty * price;

				const itemDiscount = calculateDiscountAmount({
					quantity: item.quantity,
					price: item.price,
					discountInput: item.discountInput,
					discountMode: item.discountMode,
				});

				item.discountAmount = itemDiscount;
				item.total = rawTotal - itemDiscount;

				updatedItems[index] = item;
				return updatedItems;
			});
		},
		[sizes]
	);

	const addItem = useCallback((): void => {
		setItems((prev) => [
			...prev,
			{
				productId: "",
				sizePriceId: "",
				price: 0,
				quantity: 1,
				discountAmount: 0,
				costPerItem: 0,
				totalCost: 0,
				discountInput: "0",
				discountMode: "amount" as DiscountMode,
				total: 0,
			},
		]);
	}, []);

	const removeItem = useCallback((index: number): void => {
		setItems((prev) => {
			const updated = [...prev];
			updated.splice(index, 1);
			return updated;
		});
	}, []);

	const handleDiscountChange = useCallback((mode: DiscountMode, value: string): void => {
		setDiscountMode(mode);
		setDiscountInput(value);
	}, []);

	const onSubmit = async (data: InvoiceFormValues): Promise<void> => {
		const isInvalid = items.some((item) => !item.productId || !item.sizePriceId);

		if (isInvalid) {
			toast.error("You must add product and size before submitting!");
			return;
		}

		setUpdateStatus("loading");

		const datePart = invoiceDate.includes("T") ? invoiceDate.split("T")[0] : invoiceDate;
		const fullInvoiceDate = `${datePart}T${invoiceTime}`;

		startTransition(async () => {
			const result = await updateInvoice({
				invoiceId: invoice.id,
				invoiceData: {
					invoiceNumber: data.invoiceNumber,
					buyerName: data.buyerName.trim().toLowerCase(),
					invoiceDate: fullInvoiceDate,
					totalPrice,
					discount: discountAmount,
					shipping: shippingPrice,
					status,
				},
				items,
			});

			if (!result.success) {
				setUpdateStatus(null);
				toast.error(result.error || "Failed to update invoice");
				return;
			}

			setUpdateStatus("success");

			setTimeout(() => {
				router.push("/dashboard/invoices");
				router.refresh();
			}, 1300);
		});
	};

	return {
		form,
		isPending,
		updateStatus,
		items,
		invoiceDate,
		setInvoiceDate,
		status,
		setStatus,
		shippingPrice,
		setShippingPrice,
		discountMode,
		discountInput,
		discountAmount,
		discountPercent,
		handleDiscountChange,
		subtotal,
		totalPrice,
		handleItemChange,
		addItem,
		removeItem,
		onSubmit,
	};
}
