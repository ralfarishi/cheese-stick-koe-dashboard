"use client";

import { useState } from "react";
import type { Ingredient } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import AddIngredientModal from "./AddIngredientModal";

interface AddIngredientButtonProps {
	onSuccess?: () => void;
}

export default function AddIngredientButton({ onSuccess }: AddIngredientButtonProps) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				className="bg-white text-[#6D2315] hover:bg-[#6D2315] hover:text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105"
			>
				<Zap className="w-4 h-4" />
				Add Ingredient
			</Button>

			<AddIngredientModal open={open} onOpenChange={setOpen} onSuccess={onSuccess} />
		</>
	);
}
