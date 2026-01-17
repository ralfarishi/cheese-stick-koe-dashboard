import type { Ingredient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import IngredientCombobox from "../ui/IngredientCombobox";

interface AddIngredientFormProps {
	allIngredients: Ingredient[];
	selectedIngredientId: string;
	setSelectedIngredientId: (id: string) => void;
	quantity: string;
	setQuantity: (qty: string) => void;
	onAdd: () => void;
	isSaving: boolean;
	isLoading: boolean;
}

export function AddIngredientForm({
	allIngredients,
	selectedIngredientId,
	setSelectedIngredientId,
	quantity,
	setQuantity,
	onAdd,
	isSaving,
	isLoading,
}: AddIngredientFormProps) {
	const selectedUnit =
		allIngredients.find((ing) => ing.id === selectedIngredientId)?.unit || "UNIT";

	return (
		<div className="lg:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-5">
			<h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
				<Plus className="w-4 h-4 text-[#8B2E1F]" />
				Add Ingredient
			</h3>
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1">
					<IngredientCombobox
						ingredients={allIngredients}
						value={selectedIngredientId}
						onChange={setSelectedIngredientId}
						disabled={isLoading}
					/>
				</div>
				<div className="w-full sm:w-40">
					<div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#8B2E1F]/10 focus-within:border-[#8B2E1F] transition-all">
						<Input
							type="number"
							placeholder="Qty"
							className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3 w-full font-mono font-bold text-gray-900"
							value={quantity}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
						/>
						<div className="h-6 w-[1px] bg-gray-200" />
						<div className="bg-gray-50/80 px-4 h-11 flex items-center justify-center min-w-[40px]">
							<span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
								{selectedUnit}
							</span>
						</div>
					</div>
				</div>
				<Button
					onClick={onAdd}
					disabled={isSaving || isLoading}
					className="bg-[#8B2E1F] hover:bg-[#722619] text-white rounded-xl h-11 px-6 shadow-sm hover:shadow transition-all font-bold"
				>
					{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Item"}
				</Button>
			</div>
		</div>
	);
}
