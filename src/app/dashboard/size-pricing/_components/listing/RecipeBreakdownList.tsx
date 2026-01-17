import type { Ingredient, SizeComponent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RecipeComponentWithIngredient extends SizeComponent {
	ingredient?: Ingredient;
	calculatedCost?: number;
}

interface RecipeBreakdownListProps {
	components: RecipeComponentWithIngredient[];
	isLoading: boolean;
	onDeleteComponent: (id: string) => void;
}

export function RecipeBreakdownList({
	components,
	isLoading,
	onDeleteComponent,
}: RecipeBreakdownListProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
					Recipe Breakdown
				</h3>
				<span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
					{components.length} ITEMS
				</span>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="w-10 h-10 text-[#8B2E1F]/20 animate-spin" />
						<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
							Loading Recipe...
						</p>
					</div>
				</div>
			) : components.length > 0 ? (
				<div className="space-y-4">
					{/* Desktop View - Table */}
					<div className="hidden md:block border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
						<table className="w-full text-sm">
							<thead className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-widest text-[10px] border-b border-gray-100">
								<tr>
									<th className="px-6 py-4 text-left">Ingredient</th>
									<th className="px-6 py-4 text-right">Qty Needed</th>
									<th className="px-6 py-4 text-right">Subtotal Cost</th>
									<th className="px-6 py-4 text-right"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{components.map((comp) => (
									<tr key={comp.id} className="hover:bg-gray-50 transition-colors group">
										<td className="px-6 py-5">
											<div className="flex flex-col">
												<span className="font-bold text-gray-900">
													{comp.ingredient?.name || "Unknown"}
												</span>
												<span className="text-[10px] text-gray-400 font-mono">
													Rp. {formatCurrency(comp.ingredient?.costPerUnit)} /{" "}
													{comp.ingredient?.unit}
												</span>
											</div>
										</td>
										<td className="px-6 py-5 text-right">
											<span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg text-xs">
												{comp.quantityNeeded} {comp.ingredient?.unit}
											</span>
										</td>
										<td className="px-6 py-5 text-right font-bold text-[#8B2E1F]">
											Rp. {formatCurrency(comp.calculatedCost)}
										</td>
										<td className="px-6 py-5 text-right">
											<Button
												variant="ghost"
												size="icon"
												className="text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all h-8 w-8"
												onClick={() => onDeleteComponent(comp.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Mobile View - Cards */}
					<div className="md:hidden space-y-3">
						{components.map((comp) => (
							<div
								key={comp.id}
								className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
							>
								<div className="flex flex-col gap-3">
									<div className="flex items-start justify-between gap-4">
										<div className="flex flex-col">
											<span className="font-bold text-gray-900 text-sm leading-tight">
												{comp.ingredient?.name || "Unknown"}
											</span>
											<span className="text-[10px] text-gray-400 font-mono mt-0.5">
												Rp. {formatCurrency(comp.ingredient?.costPerUnit)} / {comp.ingredient?.unit}
											</span>
										</div>

										<Button
											variant="ghost"
											size="icon"
											className="text-rose-400 transition-all h-9 w-9 shrink-0"
											onClick={() => onDeleteComponent(comp.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>

									{/* Bottom Row: Qty and Subtotal */}
									<div className="flex items-center justify-between pt-3 border-t border-gray-50">
										<div className="flex flex-col gap-1">
											<span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">
												Quantity
											</span>
											<span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[10px] w-fit">
												{comp.quantityNeeded} {comp.ingredient?.unit}
											</span>
										</div>
										<div className="flex flex-col items-end gap-1">
											<span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">
												Subtotal
											</span>
											<span className="font-bold text-[#8B2E1F] text-sm">
												Rp. {formatCurrency(comp.calculatedCost)}
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
					<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
						<Info className="w-6 h-6 text-gray-200" />
					</div>
					<p className="text-gray-900 font-bold uppercase tracking-tight text-sm">
						No Ingredients Found
					</p>
					<p className="text-xs text-gray-400 mt-2 max-w-[200px] mx-auto italic">
						Start by adding ingredients to this size's recipe above.
					</p>
				</div>
			)}
		</div>
	);
}
