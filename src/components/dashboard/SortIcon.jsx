import { ArrowUp, ArrowDown } from "lucide-react";

export default function SortIcon({ active, sortOrder }) {
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
