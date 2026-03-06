import { useState, useEffect, useCallback } from "react";
import type { Invoice, InvoiceItem } from "@/lib/types";

export interface PreviewItem {
	id: string;
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
	const [items, setItems] = useState<PreviewItem[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Map invoice items directly since we already have the joined data from getInvoiceWithItems
	useEffect(() => {
		if (invoiceItems?.length) {
			const mappedItems: PreviewItem[] = invoiceItems.map((item: any) => {
				const discount = item.discountAmount || 0;
				const quantity = item.quantity || 1;
				const total = item.subtotal || 0;
				// Reconstruct original price from total and discount
				const price = (total + discount) / quantity;

				return {
					id: item.id || `${item.productId}-${item.sizePriceId}`,
					productName: item.product?.name || item.productName || "Unknown",
					sizeName: item.size?.size || item.sizeName || "Unknown",
					quantity,
					price,
					discountAmount: discount,
					total,
				};
			});

			setItems(mappedItems);
			setIsLoading(false);
			onDataReady?.(true);
		} else {
			setItems([]);
			setIsLoading(false);
			onDataReady?.(false);
		}
	}, [invoiceItems, onDataReady]);

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
