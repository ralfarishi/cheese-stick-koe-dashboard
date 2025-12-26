"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChefHat, Loader2, Plus, Trash2, Info } from "lucide-react";
import { getComponentsBySizePrice } from "@/lib/actions/size-components/getComponentsBySizePrice";
import { getAllIngredients } from "@/lib/actions/ingredients/getAllIngredients";
import { upsertSizeComponent } from "@/lib/actions/size-components/upsertSizeComponent";
import { deleteSizeComponent } from "@/lib/actions/size-components/deleteSizeComponent";
import { formatCurrency } from "@/lib/utils";
import IngredientCombobox from "./IngredientCombobox";
import { updateSize } from "@/lib/actions/size-price/updateSize";
import { Hammer } from "lucide-react";

export default function ManageRecipeModal({ open, onOpenChange, size }) {
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [components, setComponents] = useState([]);
	const [allIngredients, setAllIngredients] = useState([]);
	const [totalCOGS, setTotalCOGS] = useState(0);

	// Form state for adding new ingredient
	const [selectedIngredientId, setSelectedIngredientId] = useState("");
	const [quantity, setQuantity] = useState("");
	const [laborPercent, setLaborPercent] = useState(size?.laborPercent || 0);
	const [isUpdatingLabor, setIsUpdatingLabor] = useState(false);

	useEffect(() => {
		if (open && size) {
			fetchData();
			setLaborPercent(size.laborPercent || 0);
		}
	}, [open, size]);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [compResult, ingResult] = await Promise.all([
				getComponentsBySizePrice({ sizePriceId: size.id }),
				getAllIngredients({ limit: 100 }), // Fetch all for selector
			]);

			setComponents(compResult.data || []);
			setTotalCOGS(compResult.totalCOGS || 0);
			setAllIngredients(ingResult.data || []);
		} catch (error) {
			console.error("Failed to fetch recipe data:", error);
			toast.error("Failed to load recipe data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddComponent = async () => {
		if (!selectedIngredientId || !quantity) {
			toast.error("Please select an ingredient and enter quantity");
			return;
		}

		setIsSaving(true);
		try {
			const result = await upsertSizeComponent({
				sizePriceId: size.id,
				ingredientId: selectedIngredientId,
				quantityNeeded: parseFloat(quantity),
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Ingredient added to recipe");
				setSelectedIngredientId("");
				setQuantity("");
				fetchData(); // Refresh list
			}
		} catch (error) {
			toast.error("Failed to add component");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteComponent = async (componentId) => {
		try {
			const result = await deleteSizeComponent({ id: componentId });
			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Component removed");
				fetchData();
			}
		} catch (error) {
			toast.error("Failed to remove component");
		}
	};

	const handleUpdateLabor = async (val) => {
		const newPercent = parseFloat(val) || 0;
		setLaborPercent(newPercent);
		setIsUpdatingLabor(true);
		try {
			const result = await updateSize(size.id, {
				size: size.size,
				price: size.price,
				laborPercent: newPercent,
			});
			if (!result.success) {
				toast.error(result.message || "Failed to update labor percentage");
			}
		} catch (error) {
			toast.error("An error occurred while updating labor");
		} finally {
			setIsUpdatingLabor(false);
		}
	};

	if (!size) return null;

	// Use safety values for calculations and formatting
	const sellingPrice = size.price || 0;
	const ingredientSubtotal = totalCOGS || 0;
	const laborCost = ingredientSubtotal * (laborPercent / 100);
	const finalCOGS = ingredientSubtotal + laborCost;
	const profit = sellingPrice - finalCOGS;
	const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] max-w-4xl! max-h-[90vh] overflow-hidden flex flex-col border-none shadow-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
						<div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
							<ChefHat className="w-6 h-6 text-[#8B2E1F]" />
						</div>
						Manage Recipe: {size.size}
					</DialogTitle>
					<p className="text-sm text-gray-500">
						Define ingredients and quantities needed for this size.
					</p>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 py-4">
					{/* Summary Section - Solid Backgrounds, No Gradients */}
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

					{/* Add Component Tool & Labor Settings */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="lg:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-5">
							<h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
								<Plus className="w-4 h-4 text-[#8B2E1F]" />
								Add Ingredient
							</h3>
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1">
									<IngredientCombobox
										ingredients={allIngredients}
										value={selectedIngredientId}
										onChange={setSelectedIngredientId}
										disabled={isLoading}
									/>
								</div>
								<div className="w-full sm:w-40">
									<div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#8B2E1F]/10 focus-within:border-[#8B2E1F] transition-all">
										<Input
											type="number"
											placeholder="Qty"
											className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3 w-full font-mono font-bold text-gray-900"
											value={quantity}
											onChange={(e) => setQuantity(e.target.value)}
										/>
										<div className="h-6 w-[1px] bg-gray-200" />
										<div className="bg-gray-50/80 px-4 h-11 flex items-center justify-center min-w-[40px]">
											<span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
												{allIngredients.find((ing) => ing.id === selectedIngredientId)?.unit ||
													"UNIT"}
											</span>
										</div>
									</div>
								</div>
								<Button
									onClick={handleAddComponent}
									disabled={isSaving || isLoading}
									className="bg-[#8B2E1F] hover:bg-[#722619] text-white rounded-xl h-11 px-6 shadow-sm hover:shadow transition-all font-bold"
								>
									{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Item"}
								</Button>
							</div>
						</div>

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
										onChange={(e) => handleUpdateLabor(e.target.value)}
									/>
									<div className="h-6 w-[1px] bg-orange-100" />
									<div className="bg-orange-50/50 px-4 h-11 flex items-center justify-center">
										{isUpdatingLabor ? (
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
					</div>

					{/* Components List */}
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
															onClick={() => handleDeleteComponent(comp.id)}
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
															Rp. {formatCurrency(comp.ingredient?.costPerUnit)} /{" "}
															{comp.ingredient?.unit}
														</span>
													</div>

													<Button
														variant="ghost"
														size="icon"
														className="text-rose-400 transition-all h-9 w-9 shrink-0"
														onClick={() => handleDeleteComponent(comp.id)}
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
				</div>

				<div className="pt-6 border-t border-gray-100 flex justify-end">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="rounded-xl px-8 h-11 border-gray-200 hover:bg-gray-50 font-bold uppercase tracking-tight"
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
