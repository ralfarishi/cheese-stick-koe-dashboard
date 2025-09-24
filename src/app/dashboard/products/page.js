import { unauthorized } from "next/navigation";

import { getPageTitle } from "@/lib/utils";
import { verifySession } from "@/lib/verifySession";

import ProductPage from "./ProductPage";

export const metadata = {
	title: getPageTitle("Products"),
};

export default function Page() {
	const session = verifySession();

	if (!session) {
		unauthorized();
	}

	return <ProductPage />;
}
