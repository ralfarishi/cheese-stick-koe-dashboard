"use client";

import { useState, forwardRef, useImperativeHandle, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryStates, parseAsInteger, parseAsString, debounce } from "nuqs";

import type { Invoice, InvoiceItem, SortOrder, TableRef } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import DeleteInvoiceModal from "./DeleteInvoiceModal";
import InvoiceDownloadModal from "../preview/InvoiceDownloadModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getInvoiceWithItems } from "@/lib/actions/invoice/getInvoiceWithItem";

import { formatInvoiceDateTime, toTitleCase } from "@/lib/utils";

import {
	MoreHorizontal,
	Printer,
	Pencil,
	Trash2,
	Download,
	FileText,
	Search,
	Filter,
	Zap,
} from "lucide-react";
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
	ref,
) {
	const router = useRouter();
	const [isLoading, startTransition] = useTransition();

	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
	const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
	const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

	// nuqs state management - shallow: false triggers server refetch
	const [params, setParams] = useQueryStates(
		{
			page: parseAsInteger.withDefault(1),
			query: parseAsString.withDefault(""),
			sortOrder: parseAsString.withDefault("desc"),
		},
		{ shallow: false, startTransition },
	);

	const { page, query, sortOrder } = params;

	// Use transient state only for immediate input feedback
	const [searchTerm, setSearchTerm] = useState<string>(query);

	const [prevQuery, setPrevQuery] = useState(query);
	if (query !== prevQuery) {
		setSearchTerm(query);
		setPrevQuery(query);
	}

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setParams(
			{ query: value || null, page: 1 },
			{
				limitUrlUpdates: value === "" ? undefined : debounce(300),
			},
		);
	};

	const handleSort = async (): Promise<void> => {
		const newOrder: SortOrder = sortOrder === "asc" ? "desc" : "asc";
		await setParams({ sortOrder: newOrder, page: 1 });
	};

	const handlePageChange = async (newPage: number): Promise<void> => {
		await setParams({ page: newPage });
	};

	useImperativeHandle(ref, () => ({
		refresh: () => router.refresh(),
	}));

	const handleDownload = async (invoiceId: string, invoiceData: Invoice): Promise<void> => {
		setSelectedInvoice(invoiceData);
		setDownloadModalOpen(true);
		setIsModalLoading(true);

		const { invoice, items } = await getInvoiceWithItems(invoiceId);
		if (invoice) setSelectedInvoice(invoice);
		setInvoiceItems(items);
		setIsModalLoading(false);
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
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
							className="w-full pl-10"
							aria-label="Search invoices"
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
							<th className="px-6 py-3 text-center text-sm font-bold w-[100px]">Actions</th>
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
									<td className="px-6 py-4 text-center">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-[160px]">
												<DropdownMenuItem
													onClick={() => setTimeout(() => handleDownload(data.id, data), 100)}
													className="cursor-pointer"
												>
													<Download className="mr-2 h-4 w-4" />
													<span>Download</span>
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => {
														window.open(
															`/dashboard/invoices/${data.invoiceNumber}/print`,
															"_blank",
														);
													}}
													className="cursor-pointer"
												>
													<Printer className="mr-2 h-4 w-4" />
													<span>Print Receipt</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => router.push(`/dashboard/invoices/${data.invoiceNumber}`)}
													className="cursor-pointer"
												>
													<Pencil className="mr-2 h-4 w-4" />
													<span>Edit</span>
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => {
														setTimeout(() => {
															setSelectedInvoice(data);
															setDeleteModalOpen(true);
														}, 100);
													}}
													className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													<span>Delete</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
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
				isFetching={isModalLoading}
			/>
		</div>
	);
});

export default InvoicesTable;

