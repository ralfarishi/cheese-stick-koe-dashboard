"use client";

import { useEffect, useCallback, useReducer } from "react";
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

type RecipeState = {
	isLoading: boolean;
	isSaving: boolean;
	isUpdatingLabor: boolean;
	components: RecipeComponentWithIngredient[];
	allIngredients: Ingredient[];
	totalCOGS: number;
	selectedIngredientId: string;
	quantity: string;
	laborPercent: number;
};

type RecipeAction =
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_SAVING"; payload: boolean }
	| { type: "SET_UPDATING_LABOR"; payload: boolean }
	| {
			type: "FETCH_SUCCESS";
			payload: {
				components: RecipeComponentWithIngredient[];
				allIngredients: Ingredient[];
				totalCOGS: number;
			};
	  }
	| { type: "SET_INGREDIENT_ID"; payload: string }
	| { type: "SET_QUANTITY"; payload: string }
	| { type: "SET_LABOR_PERCENT"; payload: number }
	| { type: "RESET_FORM" };

const recipeReducer = (state: RecipeState, action: RecipeAction): RecipeState => {
	switch (action.type) {
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		case "SET_SAVING":
			return { ...state, isSaving: action.payload };
		case "SET_UPDATING_LABOR":
			return { ...state, isUpdatingLabor: action.payload };
		case "FETCH_SUCCESS":
			return {
				...state,
				components: action.payload.components,
				allIngredients: action.payload.allIngredients,
				totalCOGS: action.payload.totalCOGS,
			};
		case "SET_INGREDIENT_ID":
			return { ...state, selectedIngredientId: action.payload };
		case "SET_QUANTITY":
			return { ...state, quantity: action.payload };
		case "SET_LABOR_PERCENT":
			return { ...state, laborPercent: action.payload };
		case "RESET_FORM":
			return { ...state, selectedIngredientId: "", quantity: "" };
		default:
			return state;
	}
};

export default function ManageRecipeModal({ open, onOpenChange, size }: ManageRecipeModalProps) {
	const [state, dispatch] = useReducer(recipeReducer, {
		isLoading: false,
		isSaving: false,
		isUpdatingLabor: false,
		components: [],
		allIngredients: [],
		totalCOGS: 0,
		selectedIngredientId: "",
		quantity: "",
		laborPercent: size?.laborPercent || 0,
	});

	const {
		isLoading,
		isSaving,
		isUpdatingLabor,
		components,
		allIngredients,
		totalCOGS,
		selectedIngredientId,
		quantity,
		laborPercent,
	} = state;

	const fetchData = useCallback(async () => {
		if (!size) return;

		dispatch({ type: "SET_LOADING", payload: true });
		try {
			const [compResult, ingResult] = await Promise.all([
				getComponentsBySizePrice({ sizePriceId: size.id }),
				getAllIngredients({ limit: 100 }),
			]);

			dispatch({
				type: "FETCH_SUCCESS",
				payload: {
					components: (compResult.data as RecipeComponentWithIngredient[]) || [],
					allIngredients: ingResult.data || [],
					totalCOGS: compResult.totalCOGS || 0,
				},
			});
		} catch {
			toast.error("Failed to load recipe data");
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	}, [size]);

	useEffect(() => {
		if (open && size) {
			fetchData();
			dispatch({ type: "SET_LABOR_PERCENT", payload: size.laborPercent || 0 });
		}
	}, [open, size, fetchData]);

	const handleAddComponent = async (): Promise<void> => {
		if (!size || !selectedIngredientId || !quantity) {
			toast.error("Please select an ingredient and enter quantity");
			return;
		}

		dispatch({ type: "SET_SAVING", payload: true });
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
				dispatch({ type: "RESET_FORM" });
				fetchData();
			}
		} catch {
			toast.error("Failed to add component");
		} finally {
			dispatch({ type: "SET_SAVING", payload: false });
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
		dispatch({ type: "SET_LABOR_PERCENT", payload: newPercent });
		dispatch({ type: "SET_UPDATING_LABOR", payload: true });
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
			dispatch({ type: "SET_UPDATING_LABOR", payload: false });
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
							setSelectedIngredientId={(val: string) =>
								dispatch({ type: "SET_INGREDIENT_ID", payload: val })
							}
							quantity={quantity}
							setQuantity={(val: string) => dispatch({ type: "SET_QUANTITY", payload: val })}
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
