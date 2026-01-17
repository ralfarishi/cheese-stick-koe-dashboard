"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getIngredientHistory } from "@/lib/actions/ingredient-history/getIngredientHistory";
import { Loader2, History, ArrowRight } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { Ingredient, IngredientHistory } from "@/lib/types";

interface PriceHistoryModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ingredient: Ingredient | null;
}

export default function PriceHistoryModal({
	open,
	onOpenChange,
	ingredient,
}: PriceHistoryModalProps) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [history, setHistory] = useState<IngredientHistory[]>([]);

	const fetchHistory = useCallback(async () => {
		if (!ingredient) return;

		setIsLoading(true);
		try {
			const result = await getIngredientHistory({ ingredientId: ingredient.id });
			setHistory(result.data || []);
		} catch (error) {
			// Silent fail - history will show as empty
		} finally {
			setIsLoading(false);
		}
	}, [ingredient]);

	useEffect(() => {
		if (open && ingredient) {
			fetchHistory();
		}
	}, [open, ingredient, fetchHistory]);

	if (!ingredient) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={true}>
			<DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<History className="w-5 h-5 text-gray-600" />
						Price History: {ingredient.name}
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-2 mt-4 custom-scrollbar">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<Loader2 className="w-8 h-8 animate-spin mb-2" />
							<p className="text-sm">Loading history...</p>
						</div>
					) : history.length > 0 ? (
						<div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-4">
							{history.map((log) => (
								<div key={log.id} className="relative pl-6">
									{/* Dot */}
									<div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-orange-500 shadow-sm" />

									<div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-gray-400 line-through">
													Rp. {formatCurrency(log.oldPrice)}
												</span>
												<ArrowRight className="w-3 h-3 text-gray-400" />
												<span className="text-sm font-bold text-[#8B2E1F]">
													Rp. {formatCurrency(log.newPrice)}
												</span>
											</div>
											<span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
												Change
											</span>
										</div>

										<p className="text-xs text-gray-400 mb-2 font-mono">
											{formatDateTime(log.changedAt)}
										</p>

										{log.reason && (
											<div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg italic">
												"{log.reason}"
											</div>
										)}
									</div>
								</div>
							))}

							{/* Current Price Marker */}
							<div className="relative pl-6">
								<div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
								<p className="text-xs font-bold text-orange-600 uppercase tracking-widest pt-1">
									Initial Entry
								</p>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500 opacity-50">
							<History className="w-12 h-12 mb-3" />
							<p className="text-sm">No price changes recorded yet</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
