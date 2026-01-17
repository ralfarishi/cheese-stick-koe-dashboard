"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Ingredient } from "@/lib/types";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteIngredient } from "@/lib/actions/ingredients/deleteIngredient";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteIngredientModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ingredient: Ingredient | null;
	onSuccess?: () => void;
}

export default function DeleteIngredientModal({
	open,
	onOpenChange,
	ingredient,
	onSuccess,
}: DeleteIngredientModalProps) {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleDelete = async (): Promise<void> => {
		if (!ingredient) return;

		setIsLoading(true);
		try {
			const result = await deleteIngredient({ id: ingredient.id });

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Ingredient deleted successfully");
				onOpenChange(false);
				onSuccess?.();
			}
		} catch {
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
					<div className="flex items-center gap-3 text-rose-600 mb-2">
						<div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
							<AlertTriangle className="w-6 h-6" />
						</div>
						<DialogTitle className="text-xl">Delete Ingredient?</DialogTitle>
					</div>
					<DialogDescription className="text-gray-600">
						Are you sure you want to delete{" "}
						<span className="font-bold text-gray-900">"{ingredient.name}"</span>? This action cannot
						be undone and will remove all associated price history.
					</DialogDescription>
				</DialogHeader>

				<div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mt-2">
					<p className="text-xs text-amber-800 leading-relaxed font-medium">
						<span className="font-bold uppercase mr-1">Warning:</span>
						If this ingredient is currently used in any recipes, the deletion will be blocked to
						maintain data integrity.
					</p>
				</div>

				<div className="flex justify-end gap-3 pt-6">
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						className="bg-rose-600 hover:bg-rose-700 shadow-lg hover:shadow-rose-100 transition-all"
						onClick={handleDelete}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Delete Permanently"
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
