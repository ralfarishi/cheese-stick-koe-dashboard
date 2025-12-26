"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, cn } from "@/lib/utils";
import { updateIngredientPrice } from "@/lib/actions/ingredients/updateIngredientPrice";
import { Loader2, TrendingUp, Calculator, Info } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export default function UpdatePriceModal({ open, onOpenChange, ingredient, onSuccess }) {
	const [isLoading, setIsLoading] = useState(false);
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm();

	// const [showCalculator, setShowCalculator] = useState(false);
	const [calcData, setCalcData] = useState({ purchasePrice: "", bulkQty: "" });

	const handleCalcChange = (field, value) => {
		const newData = { ...calcData, [field]: value };
		setCalcData(newData);

		const p = parseFloat(newData.purchasePrice);
		const q = parseFloat(newData.bulkQty);

		if (!isNaN(p) && !isNaN(q) && q > 0) {
			const unitCost = parseFloat((p / q).toFixed(2));
			setValue("newPrice", unitCost, { shouldValidate: true });
		}
	};

	useEffect(() => {
		if (ingredient) {
			reset({
				newPrice: ingredient.costPerUnit,
				reason: "",
			});
		}
	}, [ingredient, reset]);

	const onSubmit = async (data) => {
		setIsLoading(true);
		try {
			const result = await updateIngredientPrice({
				id: ingredient.id,
				newPrice: data.newPrice,
				reason: data.reason,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Price updated successfully");
				onOpenChange(false);
				if (onSuccess) onSuccess();
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (!ingredient) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={true}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-orange-600" />
						Update Price: {ingredient.name}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
						<div>
							<p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
								Current Price
							</p>
							<p className="text-lg font-bold text-gray-900">
								Rp. {formatCurrency(ingredient.costPerUnit)}
							</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Unit</p>
							<p className="text-sm font-semibold text-gray-700">{ingredient.unit}</p>
						</div>
					</div>

					{/* Purchase Calculator */}
					<Accordion
						type="single"
						collapsible
						className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
					>
						<AccordionItem value="calculator" className="border-b-0">
							<AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors hover:no-underline focus-visible:ring-0">
								<div className="flex items-center gap-2">
									<Calculator className="w-4 h-4 text-orange-600" />
									<span className="text-sm font-bold text-gray-900 uppercase tracking-tight">
										Purchase Calculator
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="p-0 bg-white border-t border-gray-100">
								<div className="p-4 space-y-4">
									<div className="flex items-center gap-2 text-xs text-gray-500 bg-orange-50/50 p-2 rounded-lg border border-orange-100/50">
										<Info className="w-3 h-3 text-orange-400" />
										Calculate new price of 1 unit from a bulk purchase.
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-1.5">
											<Label className="text-[10px] uppercase font-bold text-gray-400">
												Buying Price (Rp)
											</Label>
											<Input
												type="number"
												placeholder="e.g. 32000"
												className="h-9 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/10 px-3"
												value={calcData.purchasePrice}
												onChange={(e) => handleCalcChange("purchasePrice", e.target.value)}
											/>
										</div>
										<div className="space-y-1.5">
											<Label className="text-[10px] uppercase font-bold text-gray-400">
												Buying Qty (In {ingredient.unit})
											</Label>
											<Input
												type="number"
												placeholder="e.g. 11"
												className="h-9 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/10 px-3"
												value={calcData.bulkQty}
												onChange={(e) => handleCalcChange("bulkQty", e.target.value)}
											/>
										</div>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>

					<div className="space-y-2">
						<Label htmlFor="newPrice">New Price (Rp)</Label>
						<Input
							id="newPrice"
							type="number"
							step="any"
							placeholder="Enter new price"
							{...register("newPrice", {
								required: "New price is required",
								min: { value: 0, message: "Price must be positive" },
								validate: (value) =>
									parseFloat(value) !== ingredient.costPerUnit ||
									"Price must be different from current price",
							})}
						/>
						{errors.newPrice && <p className="text-xs text-rose-500">{errors.newPrice.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="reason">Reason for Change (Optional)</Label>
						<Textarea
							id="reason"
							placeholder="e.g. Supplier price increase, holiday adjustment..."
							rows={3}
							{...register("reason")}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-orange-600 hover:bg-orange-700 text-white"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update Price"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
