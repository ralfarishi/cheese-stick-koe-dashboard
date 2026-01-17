"use client";

import type { Ingredient } from "@/lib/types";
import IngredientTable from "./_components/IngredientTable";

interface IngredientPageProps {
	initialData: Ingredient[];
	totalPages: number;
	totalCount: number;
}

export default function IngredientPage({
	initialData,
	totalPages,
	totalCount,
}: IngredientPageProps) {
	return (
		<div className="p-6">
			<IngredientTable data={initialData} totalPages={totalPages} totalCount={totalCount} />
		</div>
	);
}
