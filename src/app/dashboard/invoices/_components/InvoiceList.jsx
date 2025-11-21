"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import DeleteInvoiceModal from "./DeleteInvoiceModal";
import InvoiceDownloadModal from "./InvoiceDownloadModal";

import { getInvoiceWithItems } from "@/lib/actions/invoice/getInvoiceWithItem";

import { formatInvoiceDateTime, getStatusIcons, getStatusVariant, toTitleCase } from "@/lib/utils";

import { Pencil, Trash2, Download, FileText, Search, Filter, Zap } from "lucide-react";
import Link from "next/link";
import SortIcon from "@/components/dashboard/SortIcon";

const InvoicesTable = forwardRef(function InvoicesTable(
	{ invoices = [], totalPages = 0, totalCount = 0 },
	ref
) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [downloadModalOpen, setDownloadModalOpen] = useState(false);
	const [invoiceItems, setInvoiceItems] = useState([]);

	// Get current state from URL
	const currentPage = Number(searchParams.get("page")) || 1;
	const searchQuery = searchParams.get("query")?.toString() || "";
	const sortOrder = searchParams.get("sortOrder")?.toString() || "desc";

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

	const handleSort = () => {
		const params = new URLSearchParams(searchParams);
		const newOrder = sortOrder === "asc" ? "desc" : "asc";
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

	const handleDownload = async (invoiceId) => {
		const { invoice, items } = await getInvoiceWithItems(invoiceId);
		setSelectedInvoice(invoice);
		setInvoiceItems(items);
		setDownloadModalOpen(true);
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-5 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
							<FileText className="w-6 h-6 text-[#8B2E1F]" />
							Invoice List
						</h2>
						<p className="text-sm text-gray-500 mt-1">Manage and track all your invoices</p>
					</div>

					<div className="flex items-center gap-2">
						<Link href="/dashboard/invoices/create">
							<Button className="bg-white text-[#6D2315] hover:bg-[#6D2315] hover:text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105">
								<Zap className="w-5 h-5" />
								Create Invoice
							</Button>
						</Link>
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
							placeholder="Search by name or invoice number..."
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

			<div className="overflow-x-auto">
				<table className="w-full min-w-[800px]">
					<thead className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] text-white text-left">
						<tr>
							<th className="px-6 py-4 text-left text-sm font-bold">
								<button
									onClick={handleSort}
									className="flex items-center gap-1 hover:text-orange-200 transition-colors"
								>
									Invoice Number
									<SortIcon active={true} sortOrder={sortOrder} />
								</button>
							</th>
							<th className="px-6 py-4 text-sm font-bold">Customer</th>
							<th className="px-6 py-4 text-sm font-bold">Total Price</th>
							<th className="px-6 py-4 text-center text-sm font-bold">Date</th>
							<th className="px-6 py-4 text-center text-sm font-bold">Status</th>
							<th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
						</tr>
					</thead>
					<tbody className="text-left divide-y divide-gray-100">
						{invoices && invoices.length > 0 ? (
							invoices.map((data) => (
								<tr
									key={data.id}
									className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 group"
								>
									<td className="px-6 py-4">
										<span className="font-semibold text-gray-900">{data.invoiceNumber}</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-gray-700 font-medium">{toTitleCase(data.buyerName)}</span>
									</td>
									<td className="px-6 py-4">
										<span className="font-mono font-semibold text-gray-900">
											Rp {(data.totalPrice || 0).toLocaleString("id-ID")}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="text-gray-600 text-sm">
											{formatInvoiceDateTime(data.invoiceDate, data.createdAt)}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span
											className={`text-xs font-semibold px-3 py-1.5 inline-flex items-center rounded-full ${getStatusVariant(
												data.status
											)}`}
										>
											{getStatusIcons(data.status)}
											{toTitleCase(data.status)}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center justify-center gap-1">
											<Button
												onClick={() => {
													router.push(`/dashboard/invoices/${data.invoiceNumber}`);
												}}
												variant="ghost"
												size="icon"
												className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
												title="Edit Invoice"
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
												className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
												title="Delete Invoice"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
											<Button
												onClick={() => handleDownload(data.id)}
												variant="ghost"
												size="icon"
												className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
												title="Download Invoice"
											>
												<Download className="h-4 w-4" />
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
											<FileText className="w-8 h-8 text-gray-400" />
										</div>
										<p className="text-gray-500 font-medium">
											{searchQuery ? "No invoices found" : "No invoice data available"}
										</p>
										<p className="text-sm text-gray-400">
											{searchQuery
												? "Try different search terms"
												: "Create your first invoice to get started"}
										</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{invoices.length > 0 && (
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<p className="text-sm text-gray-600">
							Showing <span className="font-semibold">{invoices.length}</span> of{" "}
							<span className="font-semibold">{totalCount}</span> invoices
						</p>

						<div className="flex gap-2">
							{totalPages > 1 &&
								Array.from({ length: totalPages }).map((_, idx) => {
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
			<DeleteInvoiceModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				invoiceId={selectedInvoice?.id}
				onSuccess={() => {
					// Refresh data after delete
					router.refresh();
					setSelectedInvoice(null);
				}}
			/>

			<InvoiceDownloadModal
				open={downloadModalOpen}
				onOpenChange={setDownloadModalOpen}
				invoice={selectedInvoice}
				invoiceItems={invoiceItems}
			/>
		</div>
	);
});

export default InvoicesTable;

