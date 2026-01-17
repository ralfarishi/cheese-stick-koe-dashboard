import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Hammer } from "lucide-react";

interface LaborCostInputProps {
	laborPercent: number;
	onLaborChange: (value: string) => void;
	isUpdating: boolean;
}

export function LaborCostInput({ laborPercent, onLaborChange, isUpdating }: LaborCostInputProps) {
	return (
		<div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex flex-col justify-between">
			<div>
				<h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
					<Hammer className="w-4 h-4 text-orange-600" />
					Labor Cost %
				</h3>
				<div className="flex items-center bg-white border border-orange-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/10 focus-within:border-orange-500 transition-all">
					<Input
						type="number"
						placeholder="%"
						className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3 w-full font-mono font-bold text-gray-900"
						value={laborPercent}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLaborChange(e.target.value)}
					/>
					<div className="h-6 w-[1px] bg-orange-100" />
					<div className="bg-orange-50/50 px-4 h-11 flex items-center justify-center">
						{isUpdating ? (
							<Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
						) : (
							<span className="text-xs font-bold text-orange-500">%</span>
						)}
					</div>
				</div>
			</div>
			<p className="text-[10px] text-orange-400 mt-2 italic">
				Calculated from total ingredient subtotal.
			</p>
		</div>
	);
}
