"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChefHat, History, TrendingUp, Search, MoreHorizontal } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import SortIcon from "@/components/dashboard/SortIcon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AddIngredientButton from "./AddIngredientButton";
import EditIngredientModal from "./EditIngredientModal";
import DeleteIngredientModal from "./DeleteIngredientModal";
import UpdatePriceModal from "./UpdatePriceModal";
import PriceHistoryModal from "./PriceHistoryModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const IngredientTable = forwardRef(function IngredientTable(
	{ data = [], totalPages = 0, totalCount = 0 },
	ref
) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [selectedIngredient, setSelectedIngredient] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [priceModalOpen, setPriceModalOpen] = useState(false);
	const [historyModalOpen, setHistoryModalOpen] = useState(false);

	const currentPage = Number(searchParams.get("page")) || 1;
	const sortOrder = searchParams.get("sortOrder")?.toString() || "asc";
	const sortBy = searchParams.get("sortBy")?.toString() || "name";
	const query = searchParams.get("query")?.toString() || "";

	const [searchTerm, setSearchTerm] = useState(query);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm === query) return;

			const params = new URLSearchParams(searchParams);
			if (searchTerm) {
				params.set("query", searchTerm);
			} else {
				params.delete("query");
			}
			params.set("page", "1");
			router.replace(`${pathname}?${params.toString()}`);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm, pathname, router, searchParams, query]);

	const handleSort = (column) => {
		const params = new URLSearchParams(searchParams);
		let newOrder = "asc";

		if (sortBy === column) {
			newOrder = sortOrder === "asc" ? "desc" : "asc";
		} else {
			newOrder = column === "createdAt" ? "desc" : "asc";
		}

		params.set("sortBy", column);
		params.set("sortOrder", newOrder);
		params.set("page", "1");
		router.replace(`${pathname}?${params.toString()}`);
	};

	const handlePageChange = (page) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", page.toString());
		router.replace(`${pathname}?${params.toString()}`);
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
	};

	useImperativeHandle(ref, () => ({
		refresh: () => router.refresh(),
	}));

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-5 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
							<ChefHat className="w-6 h-6 text-[#8B2E1F] hidden md:block" />
							Ingredients Master Data
						</h2>
						<p className="text-sm text-gray-500 mt-1">
							Manage ingredients, units, and track price changes
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search ingredients..."
								className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-full sm:w-64 transition-all"
								value={searchTerm}
								onChange={handleSearch}
							/>
						</div>
						<AddIngredientButton
							onSuccess={() => {
								router.refresh();
							}}
						/>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] text-white">
						<tr>
							<th className="px-6 py-4 text-left text-sm font-bold whitespace-nowrap">
								<button
									onClick={() => handleSort("name")}
									className="group flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-md transition-all duration-200"
								>
									Name
									<SortIcon active={sortBy === "name"} sortOrder={sortOrder} />
								</button>
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold whitespace-nowrap">Unit</th>
							<th className="px-6 py-4 text-left text-sm font-bold whitespace-nowrap">
								<button
									onClick={() => handleSort("costPerUnit")}
									className="group flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-md transition-all duration-200"
								>
									Cost / Unit
									<SortIcon active={sortBy === "costPerUnit"} sortOrder={sortOrder} />
								</button>
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold whitespace-nowrap">
								<button
									onClick={() => handleSort("createdAt")}
									className="group flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-md transition-all duration-200"
								>
									Created At
									<SortIcon active={sortBy === "createdAt"} sortOrder={sortOrder} />
								</button>
							</th>
							<th className="px-6 py-4 text-center text-sm font-bold whitespace-nowrap">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{data && data.length > 0 ? (
							data.map((item) => (
								<tr
									key={item.id}
									className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 group"
								>
									<td className="px-6 py-4">
										<span className="font-semibold text-gray-900">{item.name}</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider">
											{item.unit}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-gray-900 font-bold">
											Rp. {formatCurrency(item.costPerUnit)}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="font-mono text-sm text-gray-600">
											{formatDateTime(item.createdAt)}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center justify-center">
											<DropdownMenu modal={false}>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg"
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="end"
													className="w-48 rounded-xl p-1.5 shadow-xl border-gray-100"
												>
													<DropdownMenuItem
														onClick={() => {
															setSelectedIngredient(item);
															setPriceModalOpen(true);
														}}
														className="flex items-center gap-2 cursor-pointer rounded-lg text-orange-600 focus:text-orange-700 focus:bg-orange-50 font-medium"
													>
														<TrendingUp className="h-4 w-4" />
														Update Price
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															setSelectedIngredient(item);
															setHistoryModalOpen(true);
														}}
														className="flex items-center gap-2 cursor-pointer rounded-lg text-gray-600 focus:text-gray-900 focus:bg-gray-50 font-medium"
													>
														<History className="h-4 w-4" />
														Price History
													</DropdownMenuItem>
													<DropdownMenuSeparator className="my-1 bg-gray-100" />
													<DropdownMenuItem
														onClick={() => {
															setSelectedIngredient(item);
															setEditModalOpen(true);
														}}
														className="flex items-center gap-2 cursor-pointer rounded-lg text-blue-600 focus:text-blue-700 focus:bg-blue-50 font-medium"
													>
														<Pencil className="h-4 w-4" />
														Edit Ingredient
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															setSelectedIngredient(item);
															setDeleteModalOpen(true);
														}}
														className="flex items-center gap-2 cursor-pointer rounded-lg text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-medium"
													>
														<Trash2 className="h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="5" className="px-6 py-12 text-center">
									<div className="flex flex-col items-center gap-3">
										<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
											<ChefHat className="w-8 h-8 text-gray-400" />
										</div>
										<p className="text-gray-500 font-medium">No ingredient data available</p>
										<p className="text-sm text-gray-400">
											Add your first ingredient to get started
										</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{data.length > 0 && (
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<p className="text-sm text-gray-600">
							Showing <span className="font-semibold">{data.length}</span> of{" "}
							<span className="font-semibold">{totalCount}</span> ingredients
						</p>

						<div className="flex gap-2">
							{Array.from({ length: totalPages }).map((_, idx) => {
								const page = idx + 1;
								return (
									<Button
										key={page}
										onClick={() => handlePageChange(page)}
										variant={page === currentPage ? "default" : "outline"}
										size="sm"
										className={`min-w-[40px] ${
											page === currentPage
												? "bg-[#8B2E1F] hover:bg-[#A63825] text-white shadow-lg"
												: "hover:border-[#8B2E1F] hover:text-[#8B2E1F]"
										}`}
									>
										{page}
									</Button>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Modals */}
			<DeleteIngredientModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				ingredient={selectedIngredient}
				onSuccess={() => {
					router.refresh();
					setSelectedIngredient(null);
				}}
			/>

			<EditIngredientModal
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				ingredient={selectedIngredient}
				onSuccess={() => {
					router.refresh();
					setSelectedIngredient(null);
				}}
			/>

			<UpdatePriceModal
				open={priceModalOpen}
				onOpenChange={setPriceModalOpen}
				ingredient={selectedIngredient}
				onSuccess={() => {
					router.refresh();
					setSelectedIngredient(null);
				}}
			/>

			<PriceHistoryModal
				open={historyModalOpen}
				onOpenChange={setHistoryModalOpen}
				ingredient={selectedIngredient}
			/>
		</div>
	);
});

export default IngredientTable;
