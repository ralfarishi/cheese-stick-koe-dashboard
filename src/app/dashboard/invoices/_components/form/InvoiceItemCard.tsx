"use client";

import type { ComponentType } from "react";
import type { DiscountMode } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DollarSign, Percent, Receipt, Tag, Trash2 } from "lucide-react";

import { calculateDiscountPercent } from "@/lib/utils";

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

// Use Pick to accept minimal required fields - compatible with both full entities and subsets
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

interface InvoiceItemCardProps {
	item: InvoiceItem;
	index: number;
	itemsLength: number;
	products: ProductBase[];
	sizes: SizeBase[];
	onItemChange: (index: number, field: string, value: string | number, mode?: DiscountMode) => void;
	onRemove: (index: number) => void;
	ProductCombobox: ComponentType<ProductComboboxProps>;
	SizeCombobox: ComponentType<SizeComboboxProps>;
}

export default function InvoiceItemCard({
	item,
	index,
	itemsLength,
	products,
	sizes,
	onItemChange,
	onRemove,
	ProductCombobox,
	SizeCombobox,
}: InvoiceItemCardProps) {
	return (
		<div className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-[#8B2E1F] rounded-2xl p-5 transition-all duration-300 hover:shadow-xl animate-item-enter">
			{/* Item Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="w-15 h-8 bg-[#A63825] rounded-lg flex items-center justify-center text-white font-bold text-sm">
						Item {index + 1}
					</div>
				</div>

				{itemsLength > 1 && (
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				)}
			</div>

			<div className="space-y-4">
				{/* Product Selection */}
				<div className="space-y-2">
					<Label className="text-xs font-semibold text-gray-600 uppercase">Product</Label>
					<div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
						<ProductCombobox
							products={products}
							value={item.productId}
							onChange={(val) => onItemChange(index, "productId", val)}
						/>
					</div>
				</div>

				{/* Size & Quantity */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					<div className="space-y-2">
						<Label className="text-xs font-semibold text-gray-600 uppercase">Size</Label>
						<SizeCombobox
							sizes={sizes}
							value={item.sizePriceId}
							onChange={(val, price) => {
								onItemChange(index, "sizePriceId", val);
								onItemChange(index, "price", price);
							}}
						/>
					</div>

					<div className="space-y-2">
						<Label className="text-xs font-semibold text-gray-600 uppercase">Quantity</Label>
						{/* Desktop */}
						<div className="hidden md:block">
							<Input
								type="number"
								value={item.quantity}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onItemChange(index, "quantity", e.target.value)
								}
								className="font-semibold text-center"
							/>
						</div>
						{/* Mobile */}
						<div className="flex items-center gap-2 md:hidden">
							<Input
								type="number"
								value={item.quantity}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onItemChange(index, "quantity", e.target.value)
								}
								className="w-20 text-center"
							/>
							<button
								type="button"
								className="w-15 px-2 py-1 border rounded bg-rose-500 text-white"
								onClick={() =>
									onItemChange(index, "quantity", Math.max(1, Number(item.quantity) - 1))
								}
							>
								-
							</button>
							<button
								type="button"
								className="w-15 px-2 py-1 border rounded bg-emerald-500 text-white"
								onClick={() => onItemChange(index, "quantity", Number(item.quantity) + 1)}
							>
								+
							</button>
						</div>
					</div>
				</div>

				{/* Price & Total */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-2">
						<Label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
							<DollarSign className="w-3 h-3" />
							Price
						</Label>
						<Input type="number" disabled value={item.price} className="bg-gray-50 font-mono" />
					</div>

					<div className="space-y-2">
						<Label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
							<Receipt className="w-3 h-3" />
							Total
						</Label>
						<Input
							disabled
							value={item.total.toLocaleString("id-ID")}
							className="bg-emerald-50 font-mono font-semibold text-emerald-700"
						/>
					</div>
				</div>

				{/* Item Discount */}
				<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
					<Label className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
						<Tag className="w-3 h-3" />
						Discount (Optional)
					</Label>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label className="text-xs text-gray-600 flex items-center gap-1">
								<Percent className="w-3 h-3" />
								Percent
							</Label>
							<Input
								type="number"
								placeholder="%"
								min={0}
								max={100}
								step="any"
								value={
									item.discountMode === "percent"
										? item.discountInput
										: calculateDiscountPercent(item)
								}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onItemChange(index, "discountInput", e.target.value, "percent")
								}
								className="bg-white"
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs text-gray-600">Amount (Rp)</Label>
							<Input
								type="number"
								placeholder="Rp"
								min={0}
								value={item.discountMode === "amount" ? item.discountInput : item.discountAmount}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onItemChange(index, "discountInput", e.target.value, "amount")
								}
								className="bg-white"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
