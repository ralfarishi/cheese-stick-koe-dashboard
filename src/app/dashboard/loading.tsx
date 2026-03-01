import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
	return (
		<div className="min-h-[80vh] w-full flex flex-col items-center justify-center gap-4 text-[#8B2E1F]">
			<div className="relative">
				<div className="absolute inset-0 rounded-full blur-xl bg-orange-200 animate-pulse"></div>
				<Loader2 className="w-12 h-12 animate-spin relative z-10" />
			</div>
			<p className="text-lg font-medium animate-pulse text-[#6D2315]">Loading data...</p>
		</div>
	);
}
