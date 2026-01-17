"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import type { ProductSizePrice, SortOrder, TableRef } from "@/lib/types";

import { Button } from "@/components/ui/button";

import EditSizeModal from "../dialogs/EditSizeModal";
import DeleteSizeModal from "../dialogs/DeleteSizeModal";
import ManageRecipeModal from "../dialogs/ManageRecipeModal";

import { Pencil, Trash2, FileText, ChefHat } from "lucide-react";

import { formatDateTime } from "@/lib/utils";
import AddSizeButton from "../ui/AddSizeButton";
import { TablePagination } from "@/components/dashboard/TablePagination";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";

interface SizePriceTableProps {
	data?: ProductSizePrice[];
	totalPages?: number;
	totalCount?: number;
}

const SizePriceTable = forwardRef<TableRef, SizePriceTableProps>(function SizePriceTable(
	{ data = [], totalPages = 0, totalCount = 0 },
	ref
) {
	const router = useRouter();

	const [selectedSize, setSelectedSize] = useState<ProductSizePrice | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
	const [recipeModalOpen, setRecipeModalOpen] = useState<boolean>(false);

	// nuqs state management - URL as source of truth, shallow: false triggers server refetch
	const [page, setPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1).withOptions({ shallow: false })
	);
	const [sortBy, setSortBy] = useQueryState(
		"sortBy",
		parseAsString.withDefault("size").withOptions({ shallow: false })
	);
	const [sortOrder, setSortOrder] = useQueryState(
		"sortOrder",
		parseAsString.withDefault("asc").withOptions({ shallow: false })
	);

	// Sync selectedSize if data updates in background
	useEffect(() => {
		if (selectedSize) {
			const updated = data.find((d) => d.id === selectedSize.id);
			if (updated) setSelectedSize(updated);
		}
	}, [data, selectedSize?.id]);

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

	useImperativeHandle(ref, () => ({
		refresh: () => router.refresh(),
	}));

	return (
		<div className="bg-white rounded-2xl shadow-lg border  border-gray-100 overflow-hidden">
			{/* Header Section */}
			<div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
							<FileText className="w-6 h-6 text-[#8B2E1F] hidden md:block" />
							Size & Price List
						</h2>
						<p className="text-sm text-gray-500 mt-1">Manage and track all your size data</p>
					</div>

					<div className="flex items-center gap-2">
						<AddSizeButton
							onSizeAdded={() => {
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
									title="Size"
									column="size"
									sortBy={sortBy}
									sortOrder={sortOrder as SortOrder}
									onSort={handleSort}
								/>
							</th>
							<th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">Price</th>
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
										<span className="font-semibold text-gray-900">{item.size}</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-gray-700 font-medium">
											Rp. {(item.price || 0).toLocaleString("id-ID")}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="font-mono font-semibold text-gray-900">
											{formatDateTime(item.createdAt)}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center justify-center gap-1">
											<Button
												onClick={() => {
													setSelectedSize(item);
													setRecipeModalOpen(true);
												}}
												variant="ghost"
												size="icon"
												className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg"
												title="Manage Recipe"
											>
												<ChefHat className="h-4 w-4" />
											</Button>
											<div className="w-px h-4 bg-gray-200 mx-1" />
											<Button
												onClick={() => {
													setSelectedSize(item);
													setEditModalOpen(true);
												}}
												variant="ghost"
												size="icon"
												className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
												title="Edit Size"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												onClick={() => {
													setSelectedSize(item);
													setDeleteModalOpen(true);
												}}
												variant="ghost"
												size="icon"
												className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
												title="Delete Size"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={4} className="px-6 py-12 text-center">
									<div className="flex flex-col items-center gap-3">
										<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
											<FileText className="w-8 h-8 text-gray-400" />
										</div>
										<p className="text-gray-500 font-medium">No size data available</p>
										<p className="text-sm text-gray-400">Create your first size to get started</p>
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
					itemLabel="sizes"
				/>
			)}

			{/* Modals */}
			<DeleteSizeModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				sizeId={selectedSize?.id}
				sizeName={selectedSize?.size}
				onSuccess={() => {
					router.refresh();
					setSelectedSize(null);
				}}
			/>

			<EditSizeModal
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				data={selectedSize}
				onSuccess={() => {
					router.refresh();
					setSelectedSize(null);
				}}
			/>

			<ManageRecipeModal
				open={recipeModalOpen}
				onOpenChange={setRecipeModalOpen}
				size={selectedSize}
			/>
		</div>
	);
});

export default SizePriceTable;
