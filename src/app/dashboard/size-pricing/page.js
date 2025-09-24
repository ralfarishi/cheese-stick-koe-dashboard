import { unauthorized } from "next/navigation";

import { getPageTitle } from "@/lib/utils";
import { verifySession } from "@/lib/verifySession";

import SizePage from "./SizePage";

export const metadata = {
	title: getPageTitle("Size"),
};

export default function page() {
	const session = verifySession();

	if (!session) {
		unauthorized();
	}

	return <SizePage />;
}
