import type { ProductSizePrice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface RecipeSummaryCardsProps {
	sellingPrice: number;
	ingredientSubtotal: number;
	laborCost: number;
	finalCOGS: number;
	profit: number;
	margin: number;
}

export function RecipeSummaryCards({
	sellingPrice,
	ingredientSubtotal,
	laborCost,
	finalCOGS,
	profit,
	margin,
}: RecipeSummaryCardsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
				<p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">
					Selling Price
				</p>
				<p className="text-xl font-bold text-gray-900">Rp. {formatCurrency(sellingPrice)}</p>
			</div>
			<div className="bg-[#8B2E1F] p-4 rounded-2xl text-white shadow-md flex flex-col justify-between">
				<div className="flex items-center justify-between mb-1">
					<p className="text-[10px] uppercase tracking-widest font-bold opacity-70 font-mono">
						Total COGS
					</p>
					<div className="flex gap-1">
						<div className="text-[8px] px-1 py-0.5 rounded bg-white/10 text-white/60 font-mono uppercase">
							Ing: {formatCurrency(ingredientSubtotal)}
						</div>
						<div className="text-[8px] px-1 py-0.5 rounded bg-white/10 text-white/60 font-mono uppercase">
							Lab: {formatCurrency(laborCost)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-xl font-bold underline underline-offset-4 decoration-orange-400/50">
						Rp. {formatCurrency(finalCOGS)}
					</p>
				</div>
			</div>
			<div
				className={`p-4 rounded-2xl border-2 shadow-sm flex flex-col justify-between ${
					margin > 30
						? "bg-emerald-50 border-emerald-100 text-emerald-900"
						: "bg-amber-50 border-amber-100 text-amber-900"
				}`}
			>
				<p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">
					Profit Margin
				</p>
				<div className="flex items-end justify-between">
					<p className="text-xl font-bold">{margin.toFixed(1)}%</p>
					<p className="text-xs font-semibold">Rp. {formatCurrency(profit)}</p>
				</div>
			</div>
		</div>
	);
}
