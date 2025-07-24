"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ProductDeleteModal from "./_components/ProductDeleteModal";
import ProductEditModal from "./_components/ProductEditModal";

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
		<Card className="p-4">
			<Input
				type="text"
				placeholder="Search product ..."
				value={searchQuery}
				onChange={(e) => {
					setSearchQuery(e.target.value);
					setCurrentPage(1);
				}}
				className="w-50 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
			/>
			<div className="overflow-auto rounded-lg border">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 dark:bg-gray-800">
						<tr>
							<th
								className="px-4 py-2 text-left font-medium cursor-pointer"
								onClick={() => {
									setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
									setCurrentPage(1); // reset ke page 1 tiap kali sorting
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

							<th className="px-4 py-2 text-left font-medium">Description</th>
							<th className="px-4 py-2 text-left font-medium">Created At</th>
							<th className="px-4 py-2 text-left font-medium">Action</th>
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((product) => (
							<tr key={product.id} className="border-t">
								<td className="px-4 py-2">{product.name}</td>
								<td className="px-4 py-2">{product.description || "-"}</td>
								<td className="px-4 py-2">{new Date(product.createdAt).toLocaleString()}</td>
								<td className="px-4 py-2 flex gap-2">
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
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="mt-4 flex justify-end gap-2">
				{Array.from({ length: totalPages }).map((_, idx) => {
					const page = idx + 1;
					return (
						<Button
							key={page}
							onClick={() => setCurrentPage(page)}
							variant={page === currentPage ? "default" : "outline"}
							size="sm"
						>
							{page}
						</Button>
					);
				})}
			</div>

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
