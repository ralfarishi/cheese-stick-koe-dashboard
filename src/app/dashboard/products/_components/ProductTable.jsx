"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ProductDeleteModal from "./ProductDeleteModal";
import ProductEditModal from "./ProductEditModal";

import { Pencil, Trash2, Filter, Search, Package } from "lucide-react";

import { formatDateTime } from "@/lib/utils";
import SortIcon from "@/components/dashboard/SortIcon";

import ProductModalButton from "./ProductModalButton";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ProductTable = forwardRef(function ProductTable(
	{ products = [], totalPages = 0, totalCount = 0 },
	ref
) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [selectedProduct, setSelectedProduct] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);

	// Get current state from URL
	const currentPage = Number(searchParams.get("page")) || 1;
	const searchQuery = searchParams.get("query")?.toString() || "";
	const sortOrder = searchParams.get("sortOrder")?.toString() || "asc";
	const sortBy = searchParams.get("sortBy")?.toString() || "name";

	const [searchTerm, setSearchTerm] = useState(searchQuery);

	// Debounced search update
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm !== searchQuery) {
				const params = new URLSearchParams(searchParams);
				if (searchTerm) {
					params.set("query", searchTerm);
				} else {
					params.delete("query");
				}
				params.set("page", "1");
				router.replace(`${pathname}?${params.toString()}`);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, searchQuery, pathname, router, searchParams]);

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

	useImperativeHandle(ref, () => ({
		refresh: () => router.refresh(),
	}));

	return (
		<div className="bg-white rounded-2xl shadow-lg border  border-gray-100 overflow-hidden">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-5 border-b border-gray-200">
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
							onChange={(e) => setSearchTerm(e.target.value)}
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
					<thead className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] text-white">
						<tr>
							<th className="px-6 py-4 text-left text-sm font-bold whitespace-nowrap">
								<button
									onClick={() => handleSort("name")}
									className="group flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-md transition-all duration-200"
								>
									Product Name
									<SortIcon active={sortBy === "name"} sortOrder={sortOrder} />
								</button>
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold whitespace-nowrap">
								Description
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
						{products && products.length > 0 ? (
							products.map((data, index) => (
								<tr
									key={data.id}
									className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 group"
								>
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
								<td colSpan="6" className="px-6 py-12 text-center">
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
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<p className="text-sm text-gray-600">
							Showing <span className="font-semibold">{products.length}</span> of{" "}
							<span className="font-semibold">{totalCount}</span> products
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
												? "shadow-lg"
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
				onSuccess={(updatedProduct) => {
					router.refresh();
					setSelectedProduct(null);
				}}
			/>
		</div>
	);
});

export default ProductTable;

