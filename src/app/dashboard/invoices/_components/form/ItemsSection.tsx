"use client";

import type { ComponentType } from "react";
import type { DiscountMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import InvoiceItemCard from "./InvoiceItemCard";

interface InvoiceItem {
	productId: string;
	sizePriceId: string;
	quantity: number;
	price: number;
	discountAmount: number;
	discountInput: string;
	discountMode: DiscountMode;
	total: number;
}

// Base interfaces for type compatibility
interface ProductBase {
	id: string;
	name: string;
}

interface SizeBase {
	id: string;
	size: string;
	price: number;
}

interface ProductComboboxProps {
	products: ProductBase[];
	value: string;
	onChange: (value: string) => void;
}

interface SizeComboboxProps {
	sizes: SizeBase[];
	value: string;
	onChange: (value: string, price: number) => void;
}

interface ItemsSectionProps {
	items: InvoiceItem[];
	products: ProductBase[];
	sizes: SizeBase[];
	onItemChange: (index: number, field: string, value: string | number, mode?: DiscountMode) => void;
	onRemove: (index: number) => void;
	onAdd: () => void;
	ProductCombobox: ComponentType<ProductComboboxProps>;
	SizeCombobox: ComponentType<SizeComboboxProps>;
}

export default function ItemsSection({
	items,
	products,
	sizes,
	onItemChange,
	onRemove,
	onAdd,
	ProductCombobox,
	SizeCombobox,
}: ItemsSectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			<div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
						<Package className="w-5 h-5 text-purple-600" />
						Invoice Items
					</h2>
					<span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
						{items.length} {items.length === 1 ? "Item" : "Items"}
					</span>
				</div>
			</div>

			<div className="p-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
					{items.map((item, index) => (
						<InvoiceItemCard
							key={index}
							item={item}
							index={index}
							itemsLength={items.length}
							products={products}
							sizes={sizes}
							onItemChange={onItemChange}
							onRemove={onRemove}
							ProductCombobox={ProductCombobox}
							SizeCombobox={SizeCombobox}
						/>
					))}
				</div>

				{/* Add Item Button */}
				<div className="mt-6 flex justify-start">
					<Button type="button" onClick={onAdd} className="w-full md:w-auto">
						<Plus className="w-5 h-5" />
						Add Another Item
					</Button>
				</div>
			</div>
		</div>
	);
}
