"use client";

import IngredientTable from "./_components/IngredientTable";

export default function IngredientPage({ initialData, totalPages, totalCount }) {
	return (
		<div className="p-6">
			<IngredientTable data={initialData} totalPages={totalPages} totalCount={totalCount} />
		</div>
	);
}
