import { useState, useEffect } from "react";
import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

/**
 * useInvoicePreviewData - Custom hook for invoice preview data fetching and mapping
 * Extracted from InvoicePreview.jsx for better code organization
 */
export function useInvoicePreviewData({ invoiceItems, invoice, onDataReady, onReady }) {
	const [products, setProducts] = useState([]);
	const [sizes, setSizes] = useState([]);
	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch products and sizes
	useEffect(() => {
		const fetchData = async () => {
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
			const mappedItems = invoiceItems.map((item) => {
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
