import { getPageTitle } from "@/lib/utils";

import ProductPage from "./_components/ProductPage";

export const metadata = {
	title: getPageTitle("Products"),
};

export default function page() {
	return <ProductPage />;
}
