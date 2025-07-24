import { getPageTitle } from "@/lib/utils";

import SizePage from "./_components/SizePage";

export const metadata = {
	title: getPageTitle("Size"),
};

export default function page() {
	return <SizePage />;
}
