"use client";

import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceItemCard from "../../_components/form/InvoiceItemCard";
import ProductCombobox from "./ProductsCombobox";
import SizeCombobox from "./SizeCombobox";
import type { CreateInvoiceItem, ProductOption, SizeOption } from "../_hooks/useCreateInvoiceItems";
import type { DiscountMode } from "@/lib/types";

interface ItemsSectionProps {
	items: CreateInvoiceItem[];
	products: ProductOption[];
	sizes: SizeOption[];
	onItemChange: (
		index: number,
		field: keyof CreateInvoiceItem | string,
		value: string | number,
		mode?: DiscountMode | null
	) => void;
	onRemove: (index: number) => void;
	onAdd: () => void;
}

export default function ItemsSection({
	items,
	products,
	sizes,
	onItemChange,
	onRemove,
	onAdd,
}: ItemsSectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
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
						Add Item
					</Button>
				</div>
			</div>
		</div>
	);
}
