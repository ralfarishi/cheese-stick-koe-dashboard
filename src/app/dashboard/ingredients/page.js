import { unauthorized } from "next/navigation";
import { getPageTitle } from "@/lib/utils";
import { verifySession } from "@/lib/verifySession";
import IngredientPage from "./IngredientPage";
import { getAllIngredients } from "@/lib/actions/ingredients/getAllIngredients";

export const metadata = {
	title: getPageTitle("Ingredients"),
};

export default async function Page({ searchParams }) {
	const session = await verifySession();

	if (!session) {
		unauthorized();
	}

	const params = await searchParams;
	const page = Number(params?.page) || 1;
	const query = params?.query || "";
	const sortOrder = params?.sortOrder || "asc";
	const sortBy = params?.sortBy || "name";

	const {
		data: initialData,
		totalPages,
		count,
	} = await getAllIngredients({
		page,
		limit: 10,
		query,
		sortOrder,
		sortBy,
	});

	return (
		<IngredientPage
			initialData={initialData || []}
			totalPages={totalPages || 0}
			totalCount={count || 0}
		/>
	);
}
