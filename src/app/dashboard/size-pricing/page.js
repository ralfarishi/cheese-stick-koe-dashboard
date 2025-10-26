import { unauthorized } from "next/navigation";

import { getPageTitle } from "@/lib/utils";
import { verifySession } from "@/lib/verifySession";

import SizePage from "./SizePage";

export const metadata = {
	title: getPageTitle("Size"),
};

export default async function page() {
	const session = await verifySession();

	if (!session) {
		unauthorized();
	}

	return <SizePage />;
}
