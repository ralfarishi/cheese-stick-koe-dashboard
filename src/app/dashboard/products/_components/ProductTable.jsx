"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ProductDeleteModal from "./ProductDeleteModal";
import ProductEditModal from "./ProductEditModal";

import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";

const ITEMS_PER_PAGE = 10;

const ProductTable = forwardRef(function ProductTable(props, ref) {
	const [products, setProducts] = useState([]);
	const [sortOrder, setSortOrder] = useState("asc");

	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	const [selectedProduct, setSelectedProduct] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");

	if (error) return <p className="text-red-500">Failed to fetch data: {error}</p>;

	const fetchData = async () => {
		const { data, error } = await getAllProducts(sortOrder);
		if (error) setError(error.message);
		else setProducts(data);
	};

	useEffect(() => {
		fetchData();
	}, [sortOrder]);

	useImperativeHandle(ref, () => ({
		refetch: fetchData,
	}));

	const filteredData = products.filter((product) => {
		const query = searchQuery.toLowerCase();
		return product.name.toLowerCase().includes(query);
	});

	// pagination
	const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
	const paginatedData = filteredData.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	return (
		<Card className="p-4 bg-[#fffaf0] border border-[#f4e3d3] shadow-sm">
			{/* Search Field */}
			<Input
				type="text"
				placeholder="Search product..."
				value={searchQuery}
				onChange={(e) => {
					setSearchQuery(e.target.value);
					setCurrentPage(1);
				}}
				className="mb-4 w-full sm:w-64 px-3 py-2 text-sm border border-[#6D2315] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D2315]"
			/>

			{/* Table */}
			<div className="overflow-x-auto rounded-lg border border-[#fceee4]">
				<table className="w-full text-sm">
					<thead className="bg-[#fdf2e9] text-[#6D2315]">
						<tr>
							<th
								className="px-4 py-2 text-left font-semibold cursor-pointer"
								onClick={() => {
									setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
									setCurrentPage(1);
								}}
							>
								<div className="flex items-center gap-1">
									Product Name
									{sortOrder === "asc" ? (
										<ArrowUp className="w-4 h-4" />
									) : (
										<ArrowDown className="w-4 h-4" />
									)}
								</div>
							</th>
							<th className="px-4 py-2 text-left font-semibold">Description</th>
							<th className="px-4 py-2 text-left font-semibold">Created At</th>
							<th className="px-4 py-2 text-left font-semibold">Action</th>
						</tr>
					</thead>

					<tbody>
						{paginatedData.map((product) => (
							<tr
								key={product.id}
								className="border-t border-[#fceee4] hover:bg-[#fff3ec] transition-colors"
							>
								<td className="px-4 py-2 text-gray-800">{product.name}</td>
								<td className="px-4 py-2 text-gray-600">{product.description || "-"}</td>
								<td className="px-4 py-2 text-gray-500">
									{new Date(product.createdAt).toLocaleString()}
								</td>
								<td className="px-4 py-2">
									<div className="flex gap-2">
										<Button
											onClick={() => {
												setSelectedProduct(product);
												setEditModalOpen(true);
											}}
											variant="ghost"
											size="icon"
											className="text-blue-500 hover:text-blue-600"
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											onClick={() => {
												setSelectedProduct(product);
												setDeleteModalOpen(true);
											}}
											variant="ghost"
											size="icon"
											className="text-red-500 hover:text-red-600"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="mt-4 flex justify-end flex-wrap gap-2">
				{Array.from({ length: totalPages }).map((_, idx) => {
					const page = idx + 1;
					return (
						<Button
							key={page}
							onClick={() => setCurrentPage(page)}
							variant={page === currentPage ? "default" : "outline"}
							size="sm"
							className={page === currentPage ? "bg-[#6D2315] text-white" : ""}
						>
							{page}
						</Button>
					);
				})}
			</div>

			{/* Modals */}
			<ProductDeleteModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				productId={selectedProduct?.id}
				onSuccess={() => {
					setProducts((prev) => prev.filter((p) => p.id !== selectedProduct?.id));
					setSelectedProduct(null);
				}}
			/>

			<ProductEditModal
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				product={selectedProduct}
				onSuccess={(updatedProduct) => {
					setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
					setSelectedProduct(null);
				}}
			/>
		</Card>
	);
});

export default ProductTable;
