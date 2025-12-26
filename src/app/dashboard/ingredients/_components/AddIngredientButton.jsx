"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddIngredientModal from "./AddIngredientModal";

export default function AddIngredientButton({ onSuccess }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] hover:from-[#6D2315] hover:to-[#8B2E1F] text-white shadow-lg hover:shadow-xl transition-all duration-300 gap-2 rounded-xl"
			>
				<Plus className="w-4 h-4" />
				Add Ingredient
			</Button>

			<AddIngredientModal open={open} onOpenChange={setOpen} onSuccess={onSuccess} />
		</>
	);
}
