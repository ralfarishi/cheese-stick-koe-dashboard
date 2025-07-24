"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import DeleteInvoiceModal from "./_components/DeleteInvoiceModal";
import InvoiceDownloadModal from "./_components/InvoiceDownloadModal";

import { getAllInvoice } from "@/lib/actions/invoice/getAll";
import { getInvoiceWithItems } from "@/lib/actions/invoice/getInvoiceWithItem";

import { formatInvoiceDateTime, getStatusVariant, toTitleCase } from "@/lib/utils";

import { ArrowUp, ArrowDown, Pencil, Trash2, Download } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const InvoicesTable = forwardRef(function InvoicesTable(props, ref) {
	const router = useRouter();

	const [invoice, setInvoice] = useState([]);
	const [sortOrder, setSortOrder] = useState("asc");

	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");

	const [downloadModalOpen, setDownloadModalOpen] = useState(false);
	const [invoiceItems, setInvoiceItems] = useState([]);

	if (error) return <p className="text-red-500">Failed to fetch data: {error}</p>;

	const fetchData = async () => {
		const { data, error } = await getAllInvoice(sortOrder);
		if (error) setError(error.message);
		else setInvoice(data);
	};

	useEffect(() => {
		fetchData();
	}, [sortOrder]);

	useImperativeHandle(ref, () => ({
		refetch: fetchData,
	}));

	const filteredData = invoice.filter((inv) => {
		const query = searchQuery.toLowerCase();
		return (
			inv.invoiceNumber.toLowerCase().includes(query) || inv.buyerName.toLowerCase().includes(query)
		);
	});

	// pagination
	const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
	const paginatedData = filteredData.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const handleDownload = async (invoiceId) => {
		const { invoice, items } = await getInvoiceWithItems(invoiceId);
		setSelectedInvoice(invoice);
		setInvoiceItems(items);
		setDownloadModalOpen(true);
	};

	return (
		<Card className="p-4">
			<Input
				type="text"
				placeholder="Search by name/inv.number"
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
									Invoice Number
									{sortOrder === "asc" ? (
										<ArrowUp className="w-4 h-4" />
									) : (
										<ArrowDown className="w-4 h-4" />
									)}
								</div>
							</th>

							<th className="px-4 py-2 text-left font-medium">Customer</th>
							<th className="px-4 py-2 text-left font-medium">Total Price</th>
							<th className="px-4 py-2 text-left font-medium">Date</th>
							<th className="px-4 py-2 text-left font-medium">Status</th>
							<th className="px-4 py-2 text-left font-medium">Action</th>
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((data) => (
							<tr key={data.id} className="border-t">
								<td className="px-4 py-2">{data.invoiceNumber}</td>
								<td className="px-4 py-2">{toTitleCase(data.buyerName)}</td>
								<td className="px-4 py-2">Rp. {(data.totalPrice || 0).toLocaleString("id-ID")}</td>
								<td className="px-4 py-2">
									{formatInvoiceDateTime(data.invoiceDate, data.createdAt)}
								</td>
								<td className="px-4 py-2">
									<span className={getStatusVariant(data.status)}>{toTitleCase(data.status)}</span>
								</td>
								<td className="px-4 py-2 flex gap-2">
									<Button
										onClick={() => {
											router.push(`/dashboard/invoices/${data.invoiceNumber}`);
										}}
										variant="ghost"
										size="icon"
										className="text-blue-500 hover:text-blue-600"
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										onClick={() => {
											setSelectedInvoice(data);
											setDeleteModalOpen(true);
										}}
										variant="ghost"
										size="icon"
										className="text-red-500 hover:text-red-600"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
									<Button
										onClick={() => handleDownload(data.id)}
										variant="ghost"
										size="icon"
										className="text-green-500 hover:text-green-600"
									>
										<Download className="h-4 w-4" />
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

			<DeleteInvoiceModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				invoiceId={selectedInvoice?.id}
				onSuccess={() => {
					setInvoice((prev) => prev.filter((p) => p.id !== selectedInvoice?.id));
					setSelectedInvoice(null);
				}}
			/>

			<InvoiceDownloadModal
				open={downloadModalOpen}
				onOpenChange={setDownloadModalOpen}
				invoice={selectedInvoice}
				invoiceItems={invoiceItems}
			/>
		</Card>
	);
});

export default InvoicesTable;
