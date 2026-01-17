"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import type { Product, SortOrder, TableRef } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ProductDeleteModal from "./ProductDeleteModal";
import ProductEditModal from "./ProductEditModal";

import { Pencil, Trash2, Filter, Search, Package } from "lucide-react";

import { formatDateTime } from "@/lib/utils";
import ProductModalButton from "./ProductModalButton";
import { TablePagination } from "@/components/dashboard/TablePagination";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";

interface ProductTableProps {
	products?: Product[];
	totalPages?: number;
	totalCount?: number;
}

const ProductTable = forwardRef<TableRef, ProductTableProps>(function ProductTable(
	{ products = [], totalPages = 0, totalCount = 0 },
	ref
) {
	const router = useRouter();

	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

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

	// Debounced search update
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm !== query) {
				setQuery(searchTerm || null);
				setPage(1);
			}
		}, 300);

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
							<Package className="w-6 h-6 text-[#8B2E1F] hidden md:block" />
							Product List
						</h2>
						<p className="text-sm text-gray-500 mt-1">Manage and track all your products</p>
					</div>

					<div className="flex items-center gap-2">
						<ProductModalButton
							onProductAdded={() => {
								router.refresh();
							}}
						/>
					</div>
				</div>
			</div>

			{/* Search & Filter Bar */}
			<div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<Input
							type="text"
							placeholder="Search product..."
							value={searchTerm}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
							className="w-full pl-10"
						/>
					</div>

					<Button variant="outline" className="sm:w-auto">
						<Filter className="w-4 h-4" />
						Filter
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-[#8B2E1F] text-white">
						<tr>
							<th className="px-6 py-3 text-left">
								<DataTableColumnHeader
									title="Product Name"
									column="name"
									sortBy={sortBy}
									sortOrder={sortOrder as SortOrder}
									onSort={handleSort}
								/>
							</th>
							<th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">
								Description
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
						{products && products.length > 0 ? (
							products.map((data) => (
								<tr key={data.id} className="hover:bg-orange-50 transition-all duration-200 group">
									<td className="px-6 py-4">
										<span className="font-semibold text-gray-900">{data.name}</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-gray-700 font-medium">{data.description || "-"}</span>
									</td>
									<td className="px-6 py-4">
										<span className="font-mono font-semibold text-gray-900">
											{formatDateTime(data.createdAt)}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center justify-center gap-1">
											<Button
												onClick={() => {
													setSelectedProduct(data);
													setEditModalOpen(true);
												}}
												variant="ghost"
												size="icon"
												className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
												title="Edit Product"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												onClick={() => {
													setSelectedProduct(data);
													setDeleteModalOpen(true);
												}}
												variant="ghost"
												size="icon"
												className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
												title="Delete Product"
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
											<Package className="w-8 h-8 text-gray-400" />
										</div>
										<p className="text-gray-500 font-medium">No product data available</p>
										<p className="text-sm text-gray-400">
											Create your first product to get started
										</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{products.length > 0 && (
				<TablePagination
					currentPage={page}
					totalPages={totalPages}
					totalCount={totalCount}
					itemsShown={products.length}
					onPageChange={handlePageChange}
					itemLabel="products"
				/>
			)}

			{/* Modals */}
			<ProductDeleteModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				productId={selectedProduct?.id}
				productName={selectedProduct?.name}
				onSuccess={() => {
					router.refresh();
					setSelectedProduct(null);
				}}
			/>

			<ProductEditModal
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				product={selectedProduct}
				onSuccess={() => {
					router.refresh();
					setSelectedProduct(null);
				}}
			/>
		</div>
	);
});

export default ProductTable;

