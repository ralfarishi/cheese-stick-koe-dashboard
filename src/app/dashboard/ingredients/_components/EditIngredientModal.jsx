"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateIngredient } from "@/lib/actions/ingredients/updateIngredient";
import { Loader2 } from "lucide-react";

export default function EditIngredientModal({ open, onOpenChange, ingredient, onSuccess }) {
	const [isLoading, setIsLoading] = useState(false);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		if (ingredient) {
			reset({
				name: ingredient.name,
				unit: ingredient.unit,
			});
		}
	}, [ingredient, reset]);

	const onSubmit = async (data) => {
		setIsLoading(true);
		try {
			const result = await updateIngredient({
				id: ingredient.id,
				name: data.name,
				unit: data.unit,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Ingredient updated successfully");
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
					<DialogTitle>Edit Ingredient</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="edit-name">Ingredient Name</Label>
						<Input id="edit-name" {...register("name", { required: "Name is required" })} />
						{errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-unit">Unit</Label>
						<Input id="edit-unit" {...register("unit", { required: "Unit is required" })} />
						{errors.unit && <p className="text-xs text-rose-500">{errors.unit.message}</p>}
					</div>

					<div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-4">
						<p className="text-xs text-orange-800 font-medium">
							Note: To change the price, please use the "Update Price" button in the table. This
							ensures all price changes are tracked in the history log.
						</p>
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
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
