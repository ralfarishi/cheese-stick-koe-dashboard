"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import type { Invoice, InvoiceItem, SortOrder, TableRef } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import DeleteInvoiceModal from "./DeleteInvoiceModal";
import InvoiceDownloadModal from "../preview/InvoiceDownloadModal";

import { getInvoiceWithItems } from "@/lib/actions/invoice/getInvoiceWithItem";

import { formatInvoiceDateTime, toTitleCase } from "@/lib/utils";

import { Pencil, Trash2, Download, FileText, Search, Filter, Zap } from "lucide-react";
import Link from "next/link";
import InlineStatusUpdate from "./InlineStatusUpdate";
import { TablePagination } from "@/components/dashboard/TablePagination";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";

interface InvoicesTableProps {
	invoices?: Invoice[];
	totalPages?: number;
	totalCount?: number;
}

const InvoicesTable = forwardRef<TableRef, InvoicesTableProps>(function InvoicesTable(
	{ invoices = [], totalPages = 0, totalCount = 0 },
	ref
) {
	const router = useRouter();

	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
	const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

	// nuqs state management - shallow: false triggers server refetch
	const [page, setPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1).withOptions({ shallow: false })
	);
	const [query, setQuery] = useQueryState(
		"query",
		parseAsString.withDefault("").withOptions({ shallow: false })
	);
	const [sortOrder, setSortOrder] = useQueryState(
		"sortOrder",
		parseAsString.withDefault("desc").withOptions({ shallow: false })
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

	const handleSort = async (): Promise<void> => {
		const newOrder: SortOrder = sortOrder === "asc" ? "desc" : "asc";
		await Promise.all([setSortOrder(newOrder), setPage(1)]);
	};

	const handlePageChange = async (newPage: number): Promise<void> => {
		await setPage(newPage);
	};

	useImperativeHandle(ref, () => ({
		refresh: () => router.refresh(),
	}));

	const handleDownload = async (invoiceId: string): Promise<void> => {
		const { invoice, items } = await getInvoiceWithItems(invoiceId);
		setSelectedInvoice(invoice);
		setInvoiceItems(items);
		setDownloadModalOpen(true);
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
			{/* Header Section */}
			<div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
							<FileText className="w-6 h-6 text-[#8B2E1F] hidden md:block" />
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

			<div className="overflow-x-auto">
				<table className="w-full min-w-[800px]">
					<thead className="bg-[#8B2E1F] text-white text-left">
						<tr>
							<th className="px-6 py-3 text-left">
								<DataTableColumnHeader
									title="Invoice Number"
									column="invoiceNumber"
									sortBy="invoiceNumber"
									sortOrder={sortOrder as SortOrder}
									onSort={handleSort}
								/>
							</th>
							<th className="px-6 py-3 font-bold text-sm">Customer</th>
							<th className="px-6 py-3 font-bold text-sm text-left">Total Price</th>
							<th className="px-6 py-3 text-center text-sm font-bold">Date</th>
							<th className="px-6 py-3 text-center text-sm font-bold">Status</th>
							<th className="px-6 py-3 text-center text-sm font-bold">Actions</th>
						</tr>
					</thead>
					<tbody className="text-left divide-y divide-gray-100">
						{invoices && invoices.length > 0 ? (
							invoices.map((data) => (
								<tr key={data.id} className="hover:bg-orange-50 transition-all duration-200 group">
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
											{formatInvoiceDateTime(data.invoiceDate, null)}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<InlineStatusUpdate
											invoiceId={data.id}
											currentStatus={data.status as "pending" | "success" | "canceled"}
										/>
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
								<td colSpan={6} className="px-6 py-12 text-center">
									<div className="flex flex-col items-center gap-3">
										<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
											<FileText className="w-8 h-8 text-gray-400" />
										</div>
										<p className="text-gray-500 font-medium">
											{query ? "No invoices found" : "No invoice data available"}
										</p>
										<p className="text-sm text-gray-400">
											{query
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
				<TablePagination
					currentPage={page}
					totalPages={totalPages}
					totalCount={totalCount}
					itemsShown={invoices.length}
					onPageChange={handlePageChange}
					itemLabel="invoices"
				/>
			)}

			{/* Modals */}
			<DeleteInvoiceModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				invoiceId={selectedInvoice?.id}
				invoiceNumber={selectedInvoice?.invoiceNumber}
				onSuccess={() => {
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

