import { useState, useEffect, useCallback } from "react";
import type { Invoice, InvoiceItem, Product, ProductSizePrice } from "@/lib/types";
import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

export interface PreviewItem {
	productName: string;
	sizeName: string;
	quantity: number;
	price: number;
	discountAmount: number;
	total: number;
}

export interface UseInvoicePreviewDataProps {
	invoiceItems: InvoiceItem[];
	invoice: Invoice;
	onDataReady?: (ready: boolean) => void;
	onReady?: () => void;
}

export interface UseInvoicePreviewDataReturn {
	isLoading: boolean;
	items: PreviewItem[];
	subtotal: number;
	discountPercent: number;
	gapRows: number;
}

/**
 * useInvoicePreviewData - Custom hook for invoice preview data fetching and mapping
 */
export function useInvoicePreviewData({
	invoiceItems,
	invoice,
	onDataReady,
	onReady,
}: UseInvoicePreviewDataProps): UseInvoicePreviewDataReturn {
	const [products, setProducts] = useState<Product[]>([]);
	const [sizes, setSizes] = useState<ProductSizePrice[]>([]);
	const [items, setItems] = useState<PreviewItem[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Fetch products and sizes
	useEffect(() => {
		const fetchData = async (): Promise<void> => {
			setIsLoading(true);
			const { data: productsData } = await getAllProducts({ limit: 1000 });
			const { data: sizeData } = await getAllSizePrice({ limit: 1000 });

			setProducts(productsData || []);
			setSizes(sizeData || []);
			setIsLoading(false);
		};

		fetchData();
	}, []);

	// Map invoice items with product and size details
	useEffect(() => {
		if (invoiceItems?.length && products.length && sizes.length) {
			const mappedItems: PreviewItem[] = invoiceItems.map((item) => {
				const product = products.find((p) => p.id === item.productId);
				const size = sizes.find((s) => s.id === item.sizePriceId);
				const price = size?.price || 0;
				const discount = item.discountAmount || 0;
				const quantity = item.quantity;

				return {
					productName: product?.name || "Unknown",
					sizeName: size?.size || "Unknown",
					quantity,
					price,
					discountAmount: discount,
					total: quantity * price - discount,
				};
			});

			setItems(mappedItems);
			onDataReady?.(true);
		} else {
			onDataReady?.(false);
		}
	}, [invoiceItems, products, sizes, onDataReady]);

	// Notify when ready
	useEffect(() => {
		if (!items.length) return;

		const timer = setTimeout(() => {
			onReady?.();
		}, 0);

		return () => clearTimeout(timer);
	}, [items, onReady]);

	// Calculate totals
	const subtotal = items.reduce((acc, item) => acc + item.total, 0);
	const discount = invoice.discount || 0;
	const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;

	const TOTAL_GAP_ROWS = 10;
	const gapRows = Math.max(0, TOTAL_GAP_ROWS - items.length);

	return {
		isLoading,
		items,
		subtotal,
		discountPercent,
		gapRows,
	};
}
