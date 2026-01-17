"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { ProductSizePrice, Ingredient, SizeComponent } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { getComponentsBySizePrice } from "@/lib/actions/size-components/getComponentsBySizePrice";
import { getAllIngredients } from "@/lib/actions/ingredients/getAllIngredients";
import { upsertSizeComponent } from "@/lib/actions/size-components/upsertSizeComponent";
import { deleteSizeComponent } from "@/lib/actions/size-components/deleteSizeComponent";
import { updateSize } from "@/lib/actions/size-price/updateSize";

import { RecipeSummaryCards } from "../listing/RecipeSummaryCards";
import { AddIngredientForm } from "../forms/AddIngredientForm";
import { LaborCostInput } from "../ui/LaborCostInput";
import { RecipeBreakdownList } from "../listing/RecipeBreakdownList";

interface ManageRecipeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	size: ProductSizePrice | null;
}

interface RecipeComponentWithIngredient extends SizeComponent {
	ingredient?: Ingredient;
	calculatedCost?: number;
}

export default function ManageRecipeModal({ open, onOpenChange, size }: ManageRecipeModalProps) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [components, setComponents] = useState<RecipeComponentWithIngredient[]>([]);
	const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
	const [totalCOGS, setTotalCOGS] = useState<number>(0);

	// Form state for adding new ingredient
	const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
	const [quantity, setQuantity] = useState<string>("");
	const [laborPercent, setLaborPercent] = useState<number>(size?.laborPercent || 0);
	const [isUpdatingLabor, setIsUpdatingLabor] = useState<boolean>(false);

	const fetchData = useCallback(async () => {
		if (!size) return;

		setIsLoading(true);
		try {
			const [compResult, ingResult] = await Promise.all([
				getComponentsBySizePrice({ sizePriceId: size.id }),
				getAllIngredients({ limit: 100 }),
			]);

			setComponents((compResult.data as RecipeComponentWithIngredient[]) || []);
			setTotalCOGS(compResult.totalCOGS || 0);
			setAllIngredients(ingResult.data || []);
		} catch {
			toast.error("Failed to load recipe data");
		} finally {
			setIsLoading(false);
		}
	}, [size]);

	useEffect(() => {
		if (open && size) {
			fetchData();
			setLaborPercent(size.laborPercent || 0);
		}
	}, [open, size, fetchData]);

	const handleAddComponent = async (): Promise<void> => {
		if (!size || !selectedIngredientId || !quantity) {
			toast.error("Please select an ingredient and enter quantity");
			return;
		}

		setIsSaving(true);
		try {
			const result = await upsertSizeComponent({
				sizePriceId: size.id,
				ingredientId: selectedIngredientId,
				quantityNeeded: parseFloat(quantity),
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Ingredient added to recipe");
				setSelectedIngredientId("");
				setQuantity("");
				fetchData();
			}
		} catch {
			toast.error("Failed to add component");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteComponent = async (componentId: string): Promise<void> => {
		try {
			const result = await deleteSizeComponent({ id: componentId });
			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Ingredient removed");
				fetchData();
			}
		} catch {
			toast.error("Failed to remove ingredient");
		}
	};

	const handleUpdateLabor = async (val: string): Promise<void> => {
		if (!size) return;

		const newPercent = parseFloat(val) || 0;
		setLaborPercent(newPercent);
		setIsUpdatingLabor(true);
		try {
			const result = await updateSize(size.id, {
				size: size.size,
				price: size.price,
				laborPercent: newPercent,
			});
			if (!result.success) {
				toast.error(result.message || "Failed to update labor percentage");
			}
		} catch {
			toast.error("An error occurred while updating labor");
		} finally {
			setIsUpdatingLabor(false);
		}
	};

	if (!size) return null;

	// Calculate derived values
	const sellingPrice = size.price || 0;
	const ingredientSubtotal = totalCOGS || 0;
	const laborCost = ingredientSubtotal * (laborPercent / 100);
	const finalCOGS = ingredientSubtotal + laborCost;
	const profit = sellingPrice - finalCOGS;
	const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] max-w-4xl! max-h-[90vh] overflow-hidden flex flex-col border-none shadow-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
						<div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
							<ChefHat className="w-6 h-6 text-[#8B2E1F]" />
						</div>
						Manage Recipe: {size.size}
					</DialogTitle>
					<p className="text-sm text-gray-500">
						Define ingredients and quantities needed for this size.
					</p>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 py-4">
					<RecipeSummaryCards
						sellingPrice={sellingPrice}
						ingredientSubtotal={ingredientSubtotal}
						laborCost={laborCost}
						finalCOGS={finalCOGS}
						profit={profit}
						margin={margin}
					/>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<AddIngredientForm
							allIngredients={allIngredients}
							selectedIngredientId={selectedIngredientId}
							setSelectedIngredientId={setSelectedIngredientId}
							quantity={quantity}
							setQuantity={setQuantity}
							onAdd={handleAddComponent}
							isSaving={isSaving}
							isLoading={isLoading}
						/>

						<LaborCostInput
							laborPercent={laborPercent}
							onLaborChange={handleUpdateLabor}
							isUpdating={isUpdatingLabor}
						/>
					</div>

					<RecipeBreakdownList
						components={components}
						isLoading={isLoading}
						onDeleteComponent={handleDeleteComponent}
					/>
				</div>

				<div className="pt-6 border-t border-gray-100 flex justify-end">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="rounded-xl px-8 h-11 border-gray-200 hover:bg-gray-50 font-bold uppercase tracking-tight"
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
