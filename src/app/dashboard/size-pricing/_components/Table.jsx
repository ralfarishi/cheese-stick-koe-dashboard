"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import EditSizeModal from "./EditSizeModal";
import DeleteSizeModal from "./DeleteSizeModal";

import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";

import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

const ITEMS_PER_PAGE = 10;

const SizePriceTable = forwardRef(function SizePriceTable(props, ref) {
	const [size, setSize] = useState([]);
	const [sortOrder, setSortOrder] = useState("asc");

	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	const [selectedSize, setSelectedSize] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);

	if (error) return <p className="text-red-500">Failed to fetch data: {error}</p>;

	const fetchData = async () => {
		const { data, error } = await getAllSizePrice(sortOrder);
		if (error) setError(error.message);
		else setSize(data);
	};

	useEffect(() => {
		fetchData();
	}, [sortOrder]);

	useImperativeHandle(ref, () => ({
		refetch: fetchData,
	}));

	// pagination
	const totalPages = Math.ceil(size.length / ITEMS_PER_PAGE);
	const paginatedData = size.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	return (
		<Card className="p-4 bg-[#fffaf0] border border-[#f4e3d3] shadow-sm">
			<div className="overflow-x-auto rounded-lg border border-[#fceee4]">
				<table className="w-full text-sm">
					<thead className="bg-[#fdf2e9] text-[#6D2315]">
						<tr>
							<th
								className="px-4 py-2 text-left font-semibold cursor-pointer"
								onClick={() => {
									setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
									setCurrentPage(1); // reset ke page 1 tiap kali sorting
								}}
							>
								<div className="flex items-center gap-1">
									Size
									{sortOrder === "asc" ? (
										<ArrowUp className="w-4 h-4" />
									) : (
										<ArrowDown className="w-4 h-4" />
									)}
								</div>
							</th>

							<th className="px-4 py-2 text-left font-semibold">Price</th>
							<th className="px-4 py-2 text-left font-semibold">Created At</th>
							<th className="px-4 py-2 text-left font-semibold">Action</th>
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((data) => (
							<tr
								key={data.id}
								className="border-t border-[#fceee4] hover:bg-[#fff3ec] transition-colors"
							>
								<td className="px-4 py-2 text-gray-800">{data.size}</td>
								<td className="px-4 py-2 text-gray-800">
									Rp. {(data.price || 0).toLocaleString("id-ID")}
								</td>
								<td className="px-4 py-2 text-gray-800">
									{new Date(data.createdAt).toLocaleString()}
								</td>
								<td className="px-4 py-2">
									<div className="flex gap-2">
										<Button
											onClick={() => {
												setSelectedSize(data);
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
												setSelectedSize(data);
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

			<EditSizeModal
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				data={selectedSize}
				onSuccess={(updatedSize) => {
					setSize((prev) => prev.map((p) => (p.id === updatedSize.id ? updatedSize : p)));
					setSelectedSize(null);
				}}
			/>

			<DeleteSizeModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				sizeId={selectedSize?.id}
				onSuccess={() => {
					setSize((prev) => prev.filter((p) => p.id !== selectedSize?.id));
					setSelectedSize(null);
				}}
			/>
		</Card>
	);
});

export default SizePriceTable;
