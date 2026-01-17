"use client";

import { useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import type { DiscountMode } from "@/lib/types";
import { calculateDiscountAmount } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface ProductOption {
	id: string;
	name: string;
}

export interface SizeOption {
	id: string;
	size: string;
	price: number;
}

export interface CreateInvoiceItem {
	productId: string;
	sizePriceId: string;
	quantity: number;
	price: number;
	discountMode: DiscountMode;
	discountInput: string;
	discountAmount: number;
	total: number;
}

export interface CreateInvoiceFormValues {
	invoiceNumber: string;
	buyerName: string;
	shippingPrice: string;
}

export interface SubmitInvoiceData {
	invoiceNumber: string;
	buyerName: string;
	invoiceDate: string;
	shippingPrice: number;
	discountAmount: number;
	totalPrice: number;
	items: CreateInvoiceItem[];
	user: User;
}

// ============================================================================
// Hook
// ============================================================================

const createEmptyItem = (): CreateInvoiceItem => ({
	productId: "",
	sizePriceId: "",
	quantity: 1,
	price: 0,
	discountMode: "amount",
	discountInput: "",
	discountAmount: 0,
	total: 0,
});

interface UseCreateInvoiceItemsProps {
	sizes: SizeOption[];
}

interface UseCreateInvoiceItemsReturn {
	items: CreateInvoiceItem[];
	addItem: () => void;
	removeItem: (index: number) => void;
	handleItemChange: (
		index: number,
		field: keyof CreateInvoiceItem | string,
		value: string | number,
		mode?: DiscountMode | null
	) => void;
	resetItems: () => void;
	subtotal: number;
}

export function useCreateInvoiceItems({
	sizes,
}: UseCreateInvoiceItemsProps): UseCreateInvoiceItemsReturn {
	const [items, setItems] = useState<CreateInvoiceItem[]>([createEmptyItem()]);

	const addItem = useCallback(() => {
		setItems((prev) => [...prev, createEmptyItem()]);
	}, []);

	const removeItem = useCallback((index: number) => {
		setItems((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const updateItemField = (
		item: CreateInvoiceItem,
		field: keyof CreateInvoiceItem | string,
		value: string | number,
		mode: DiscountMode | null = null
	): void => {
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

		const discountAmount = calculateDiscountAmount({
			quantity: item.quantity,
			price: item.price,
			discountInput: item.discountInput,
			discountMode: item.discountMode,
		});

		item.discountAmount = discountAmount;
		item.total = rawTotal - discountAmount;
	};

	const handleItemChange = useCallback(
		(
			index: number,
			field: keyof CreateInvoiceItem | string,
			value: string | number,
			mode: DiscountMode | null = null
		) => {
			setItems((prev) => {
				const updatedItems = [...prev];
				const item = { ...updatedItems[index] };
				updateItemField(item, field, value, mode);
				updatedItems[index] = item;
				return updatedItems;
			});
		},
		[sizes]
	);

	const resetItems = useCallback(() => {
		setItems([createEmptyItem()]);
	}, []);

	const subtotal = items.reduce((sum, item) => sum + item.total, 0);

	return {
		items,
		addItem,
		removeItem,
		handleItemChange,
		resetItems,
		subtotal,
	};
}
