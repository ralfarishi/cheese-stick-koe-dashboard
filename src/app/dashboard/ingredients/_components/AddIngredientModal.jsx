"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addIngredient } from "@/lib/actions/ingredients/addIngredient";
import { Loader2, Calculator, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export default function AddIngredientModal({ open, onOpenChange, onSuccess }) {
	const [isLoading, setIsLoading] = useState(false);
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: "",
			unit: "gr",
			costPerUnit: "",
		},
	});

	const [showCalculator, setShowCalculator] = useState(false);
	const [calcData, setCalcData] = useState({ purchasePrice: "", bulkQty: "" });

	const handleCalcChange = (field, value) => {
		const newData = { ...calcData, [field]: value };
		setCalcData(newData);

		const p = parseFloat(newData.purchasePrice);
		const q = parseFloat(newData.bulkQty);

		if (!isNaN(p) && !isNaN(q) && q > 0) {
			const unitCost = parseFloat((p / q).toFixed(2));
			setValue("costPerUnit", unitCost, { shouldValidate: true });
		}
	};

	const onSubmit = async (data) => {
		setIsLoading(true);
		try {
			const result = await addIngredient({
				name: data.name,
				unit: data.unit,
				costPerUnit: data.costPerUnit,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Ingredient added successfully");
				reset();
				onOpenChange(false);
				if (onSuccess) onSuccess();
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={true}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Ingredient</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Ingredient Name</Label>
						<Input
							id="name"
							placeholder="e.g. Sugar, Flour, Butter"
							{...register("name", { required: "Name is required" })}
						/>
						{errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
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
									<Calculator className="w-4 h-4 text-[#8B2E1F]" />
									<span className="text-sm font-bold text-gray-900 uppercase tracking-tight">
										Purchase Calculator
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="p-0 bg-white border-t border-gray-100">
								<div className="p-4 space-y-4">
									<div className="flex items-center gap-2 text-xs text-gray-500 bg-orange-50/50 p-2 rounded-lg border border-orange-100/50">
										<Info className="w-3 h-3 text-orange-400" />
										Calculate cost of 1 unit (e.g. 1g) from a bulk purchase.
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-1.5">
											<Label className="text-[10px] uppercase font-bold text-gray-400">
												Buying Price
											</Label>
											<Input
												type="number"
												placeholder="e.g. 5000"
												className="h-9 rounded-xl border-gray-200 focus:border-[#8B2E1F] focus:ring-[#8B2E1F]/10 px-3"
												value={calcData.purchasePrice}
												onChange={(e) => handleCalcChange("purchasePrice", e.target.value)}
											/>
										</div>
										<div className="space-y-1.5">
											<Label className="text-[10px] uppercase font-bold text-gray-400">
												Total Qty (In {watch("unit") || "Units"})
											</Label>
											<Input
												type="number"
												placeholder={`e.g. 500`}
												className="h-9 rounded-xl border-gray-200 focus:border-[#8B2E1F] focus:ring-[#8B2E1F]/10 px-3"
												value={calcData.bulkQty}
												onChange={(e) => handleCalcChange("bulkQty", e.target.value)}
											/>
										</div>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="unit">Unit</Label>
							<Input
								id="unit"
								placeholder="e.g. gr, ml, pcs"
								{...register("unit", { required: "Unit is required" })}
							/>
							{errors.unit && <p className="text-xs text-rose-500">{errors.unit.message}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="costPerUnit">Cost Per Unit (Rp)</Label>
							<Input
								id="costPerUnit"
								type="number"
								step="any"
								placeholder="0"
								{...register("costPerUnit", {
									required: "Cost is required",
									min: { value: 0, message: "Cost must be positive" },
								})}
							/>
							{errors.costPerUnit && (
								<p className="text-xs text-rose-500">{errors.costPerUnit.message}</p>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-[#8B2E1F] hover:bg-[#A63825] text-white"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adding...
								</>
							) : (
								"Add Ingredient"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
