"use client";

import { useState } from "react";
import IngredientTable from "./_components/IngredientTable";
import { ChefHat } from "lucide-react";

export default function IngredientPage({ initialData, totalPages, totalCount }) {
	return (
		<div className="p-6">
			<IngredientTable data={initialData} totalPages={totalPages} totalCount={totalCount} />
		</div>
	);
}
