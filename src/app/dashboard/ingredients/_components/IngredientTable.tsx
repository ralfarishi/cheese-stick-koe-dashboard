"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChefHat, History, TrendingUp, Search, MoreHorizontal } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import SortIcon from "@/components/dashboard/SortIcon";
import AddIngredientButton from "./AddIngredientButton";
import EditIngredientModal from "./EditIngredientModal";
import DeleteIngredientModal from "./DeleteIngredientModal";
import UpdatePriceModal from "./UpdatePriceModal";
import PriceHistoryModal from "./PriceHistoryModal";
import type { Ingredient, SortOrder, TableRef } from "@/lib/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TablePagination } from "@/components/dashboard/TablePagination";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";

interface IngredientTableProps {
	data?: Ingredient[];
	totalPages?: number;
	totalCount?: number;
}

const IngredientTable = forwardRef<TableRef, IngredientTableProps>(function IngredientTable(
	{ data = [], totalPages = 0, totalCount = 0 },
	ref
) {
	const router = useRouter();

	const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
	const [priceModalOpen, setPriceModalOpen] = useState<boolean>(false);
	const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

	// nuqs state management - shallow: false triggers server refetch
	const [page, setPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1).withOptions({ shallow: false })
	);
	const [query, setQuery] = useQueryState(
		"query",
		parseAsString.withDefault("").withOptions({ shallow: false })
	);
	const [sortBy, setSortBy] = useQueryState(
		"sortBy",
		parseAsString.withDefault("name").withOptions({ shallow: false })
	);
	const [sortOrder, setSortOrder] = useQueryState(
		"sortOrder",
		parseAsString.withDefault("asc").withOptions({ shallow: false })
	);

	const [searchTerm, setSearchTerm] = useState<string>(query);

	// Sync searchTerm when query changes (e.g., back/forward navigation)
	useEffect(() => {
		setSearchTerm(query);
	}, [query]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm !== query) {
				setQuery(searchTerm || null);
				setPage(1);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm, query, setQuery, setPage]);

	const handleSort = async (column: string, order?: SortOrder): Promise<void> => {
		let newOrder: SortOrder = order || "asc";

		if (!order) {
			if (sortBy === column) {
				newOrder = sortOrder === "asc" ? "desc" : "asc";
			} else {
				newOrder = column === "createdAt" ? "desc" : "asc";
			}
		}

		await Promise.all([setSortBy(column), setSortOrder(newOrder), setPage(1)]);
	};

	const handlePageChange = async (newPage: number): Promise<void> => {
		await setPage(newPage);
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setSearchTerm(e.target.value);
	};

	useImperativeHandle(ref, () => ({
		refresh: () => router.refresh(),
	}));

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			{/* Header Section */}
			<div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
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
					<thead className="bg-[#8B2E1F] text-white">
						<tr>
							<th className="px-6 py-3 text-left">
								<DataTableColumnHeader
									title="Name"
									column="name"
									sortBy={sortBy}
									sortOrder={sortOrder as SortOrder}
									onSort={handleSort}
								/>
							</th>
							<th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">Unit</th>
							<th className="px-6 py-3 text-left">
								<DataTableColumnHeader
									title="Cost / Unit"
									column="costPerUnit"
									sortBy={sortBy}
									sortOrder={sortOrder as SortOrder}
									onSort={handleSort}
								/>
							</th>
							<th className="px-6 py-3 text-left">
								<DataTableColumnHeader
									title="Created At"
									column="createdAt"
									sortBy={sortBy}
									sortOrder={sortOrder as SortOrder}
									onSort={handleSort}
								/>
							</th>
							<th className="px-6 py-4 text-center text-sm font-bold whitespace-nowrap">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{data && data.length > 0 ? (
							data.map((item) => (
								<tr key={item.id} className="hover:bg-orange-50 transition-all duration-200 group">
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
								<td colSpan={5} className="px-6 py-12 text-center">
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
				<TablePagination
					currentPage={page}
					totalPages={totalPages}
					totalCount={totalCount}
					itemsShown={data.length}
					onPageChange={handlePageChange}
					itemLabel="ingredients"
				/>
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
