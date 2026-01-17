"use client";

import type { Control, Controller as ControllerType, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { DollarSign, Percent, Tag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateInvoiceFormValues } from "../_hooks/useCreateInvoiceItems";

interface SummarySectionProps {
	control: Control<CreateInvoiceFormValues>;
	errors: FieldErrors<CreateInvoiceFormValues>;
	subtotal: number;
	shippingPrice: number;
	setShippingPrice: (value: number) => void;
	discountMode: "amount" | "percent";
	setDiscountMode: (mode: "amount" | "percent") => void;
	discountInput: number;
	setDiscountInput: (value: number) => void;
	discountAmount: number;
	discountPercent: number;
	totalPrice: number;
}

export default function SummarySection({
	control,
	errors,
	subtotal,
	shippingPrice,
	setShippingPrice,
	discountMode,
	setDiscountMode,
	discountInput,
	setDiscountInput,
	discountAmount,
	discountPercent,
	totalPrice,
}: SummarySectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
				<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
					<DollarSign className="w-5 h-5 text-emerald-600" />
					Invoice Summary
				</h2>
			</div>

			<div className="p-6 space-y-6">
				{/* General Discount */}
				<div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
					<Label className="text-sm font-bold text-amber-900 uppercase flex items-center gap-2 mb-4">
						<Tag className="w-4 h-4" />
						General Discount (Optional)
					</Label>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="text-xs text-gray-600 flex items-center gap-1">
								<Percent className="w-3 h-3" />
								Percent (%)
							</Label>
							<Input
								type="number"
								min={0}
								max={100}
								step="any"
								value={discountMode === "percent" ? discountInput : discountPercent.toFixed(2) || 0}
								onChange={(e) => {
									setDiscountMode("percent");
									setDiscountInput(Number(e.target.value));
								}}
								className="bg-white"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-gray-600">Amount (Rp)</Label>
							<Input
								type="number"
								min={0}
								value={discountMode === "amount" ? discountInput : discountAmount}
								onChange={(e) => {
									setDiscountMode("amount");
									setDiscountInput(Number(e.target.value));
								}}
								className="bg-white"
							/>
						</div>
					</div>
				</div>

				{/* Calculation Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Subtotal */}
					<div className="space-y-2">
						<Label className="text-sm font-semibold text-gray-700">Subtotal</Label>
						<div className="relative">
							<Input
								disabled
								value={subtotal.toLocaleString("id-ID")}
								className="bg-gray-50 font-mono text-lg font-semibold pl-10"
							/>
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
								Rp
							</span>
						</div>
					</div>

					{/* Shipping */}
					<div className="space-y-2">
						<Label className="text-sm font-semibold text-gray-700">Shipping Price</Label>
						<div className="relative">
							<Controller
								name="shippingPrice"
								control={control}
								rules={{
									min: {
										value: 0,
										message: "Shipping cannot be less than 0",
									},
								}}
								render={({ field }) => (
									<Input
										{...field}
										type="number"
										value={shippingPrice}
										className="font-mono pl-10"
										onChange={(e) => {
											field.onChange(e);
											setShippingPrice(Number(e.target.value));
										}}
									/>
								)}
							/>
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
								Rp
							</span>
						</div>
						{errors.shippingPrice && (
							<p role="alert" className="text-sm text-red-500">
								{errors.shippingPrice.message}
							</p>
						)}
					</div>

					{/* Total */}
					<div className="space-y-2">
						<Label className="text-sm font-bold text-emerald-700">Total Price</Label>
						<div className="relative">
							<Input
								disabled
								value={totalPrice.toLocaleString("id-ID")}
								className="bg-emerald-50 border-2 border-emerald-300 font-mono text-lg font-bold text-emerald-700 pl-10"
							/>
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
								Rp
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
