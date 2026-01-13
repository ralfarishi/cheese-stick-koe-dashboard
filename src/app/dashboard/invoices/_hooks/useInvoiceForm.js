import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateInvoice } from "@/lib/actions/invoice/updateInvoice";
import { calculateDiscountAmount } from "@/lib/utils";

/**
 * useInvoiceForm - Custom hook for invoice form state and logic
 * Extracted from UpdateInvoiceForm.jsx for better code organization
 */
export function useInvoiceForm({ invoice, sizesData = [] }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [updateStatus, setUpdateStatus] = useState(null);

	const [sizes] = useState(sizesData);

	// Handle Date objects from Drizzle
	const invoiceDateStr =
		invoice.invoiceDate instanceof Date
			? invoice.invoiceDate.toISOString()
			: String(invoice.invoiceDate || "");
	const [invoiceDate, setInvoiceDate] = useState(invoiceDateStr.split("T")[0] || "");
	const [invoiceTime] = useState(invoiceDateStr.split("T")[1] || "00:00:00.000Z");

	const [items, setItems] = useState([]);
	const [shippingPrice, setShippingPrice] = useState(invoice.shipping || 0);
	const [status, setStatus] = useState(invoice.status || "pending");

	const [discountMode, setDiscountMode] = useState("amount");
	const [discountInput, setDiscountInput] = useState(0);

	const form = useForm({
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
			const mappedItems = invoice.items.map((item) => {
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
					discountMode: "amount",
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
	const subtotal = items.reduce((sum, item) => sum + item.total, 0);

	const discountAmount =
		discountMode === "percent"
			? Math.round(((parseFloat(discountInput) || 0) / 100) * subtotal)
			: parseInt(discountInput) || 0;

	const discountPercent =
		discountMode === "amount"
			? ((parseInt(discountInput) || 0) / subtotal) * 100
			: parseFloat(discountInput) || 0;

	const totalPrice = subtotal + (parseInt(shippingPrice) || 0) - discountAmount;

	// Handlers
	const handleItemChange = (index, field, value, mode = null) => {
		const updatedItems = [...items];
		const item = updatedItems[index];

		if (field === "sizePriceId") {
			const selectedSize = sizes.find((s) => s.id === value);
			item.sizePriceId = value;
			item.price = selectedSize?.price || 0;
		} else if (field === "quantity") {
			const parsed = parseInt(value, 10);
			item.quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
		} else if (field === "price") {
			const parsed = parseInt(value, 10);
			item.price = isNaN(parsed) ? 0 : parsed;
		} else if (field === "discountMode") {
			item.discountMode = value;
		} else if (field === "discountInput") {
			item.discountInput = value;
			item.discountMode = mode;
		} else {
			item[field] = value;
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

		setItems(updatedItems);
	};

	const addItem = () => {
		setItems([
			...items,
			{
				productId: "",
				sizePriceId: "",
				price: 0,
				quantity: 1,
				discountAmount: 0,
				discountInput: "0",
				discountMode: "amount",
				total: 0,
			},
		]);
	};

	const removeItem = (index) => {
		const updated = [...items];
		updated.splice(index, 1);
		setItems(updated);
	};

	const handleDiscountChange = (mode, value) => {
		setDiscountMode(mode);
		setDiscountInput(value);
	};

	const onSubmit = async (data) => {
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
					shipping: parseInt(shippingPrice),
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
		// Form
		form,
		isPending,
		updateStatus,

		// State
		items,
		invoiceDate,
		setInvoiceDate,
		status,
		setStatus,
		shippingPrice,
		setShippingPrice,

		// Discount
		discountMode,
		discountInput,
		discountAmount,
		discountPercent,
		handleDiscountChange,

		// Calculations
		subtotal,
		totalPrice,

		// Handlers
		handleItemChange,
		addItem,
		removeItem,
		onSubmit,
	};
}
