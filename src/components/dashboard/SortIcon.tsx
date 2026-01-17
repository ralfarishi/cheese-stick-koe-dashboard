import { ArrowUp, ArrowDown } from "lucide-react";
import type { SortOrder } from "@/lib/types";

interface SortIconProps {
	active: boolean;
	sortOrder: SortOrder;
}

export default function SortIcon({ active, sortOrder }: SortIconProps) {
	return (
		<div className="flex items-center">
			<ArrowUp
				className={`w-3 h-3 ${active && sortOrder === "asc" ? "text-white" : "text-white/30"}`}
			/>
			<ArrowDown
				className={`w-3 h-3 ${active && sortOrder === "desc" ? "text-white" : "text-white/30"}`}
			/>
		</div>
	);
}
