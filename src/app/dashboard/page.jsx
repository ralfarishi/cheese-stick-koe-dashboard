import Link from "next/link";
import { unauthorized } from "next/navigation";

import { createClient } from "@/lib/actions/supabase/server";

import { Button } from "@/components/ui/button";

import { getPageTitle, getStatusVariant, toTitleCase } from "@/lib/utils";
import {
	Activity,
	AlertTriangle,
	CheckCircle,
	FileText,
	Package,
	TrendingUp,
	Users,
	Wallet,
	Zap,
} from "lucide-react";
import CustomerChart from "@/components/dashboard/CustomerChart";

export const metadata = {
	title: getPageTitle("Dashboard"),
};

import { getCustomerStats } from "@/lib/actions/invoice/getCustomerStats";

export default async function Dashboard() {
	const supabase = await createClient();

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		unauthorized();
	}

	const currentYear = new Date().getFullYear();

	// Parallelize data fetching with optimized queries
	const [
		{ data: latestInvoices },
		{ data: statsData, error: statsError },
		{ count: totalProducts },
		customerStats,
	] = await Promise.all([
		supabase
			.from("Invoice")
			.select("id, invoiceNumber, buyerName, totalPrice, status")
			.order("invoiceDate", { ascending: false })
			.limit(5),

		supabase.rpc("get_dashboard_stats"),

		supabase.from("Product").select("*", { count: "exact", head: true }),

		getCustomerStats(currentYear),
	]);

	if (statsError) {
		// Error handled silently - dashboard shows default values
	}

	const stats = statsData || {
		totalInvoices: 0,
		totalIncome: 0,
		paidInvoices: 0,
		unpaidInvoices: 0,
		totalCustomers: 0,
	};

	const {
		totalInvoices,
		totalIncome: totalAmount,
		paidInvoices: invoicesSuccess,
		unpaidInvoices: invoicesUnpaid,
		totalCustomers,
	} = stats;

	return (
		<div className="min-h-screen bg-orange-50/30 p-4 sm:p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header Welcome Section */}
				<div className="relative overflow-hidden bg-[#8B2E1F] rounded-3xl p-6 sm:p-8 shadow-xl">
					{/* Decorative Elements */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

					<div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl hidden md:flex sm:hidden items-center justify-center">
									<Activity className="w-6 h-6 text-white" />
								</div>
								<div>
									<h1 className="text-3xl font-bold text-white flex items-center gap-2">
										Welcome back, Admin 👋
									</h1>
									<p className="text-white/80 text-sm mt-1">
										Here's what's happening with your store today
									</p>
								</div>
							</div>
						</div>

						<Link href="/dashboard/invoices/create">
							<Button className="bg-white hover:bg-orange-50 text-[#6D2315] font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105">
								<Zap className="w-5 h-5" />
								Create Invoice
							</Button>
						</Link>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Total Invoices */}
					<div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#8B2E1F] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#8B2E1F]/5 rounded-bl-full"></div>
						<div className="relative">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-[#8B2E1F] rounded-xl flex items-center justify-center shadow-lg">
									<FileText className="w-6 h-6 text-white" />
								</div>
								<div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
									<TrendingUp className="w-3 h-3" />
									+12%
								</div>
							</div>
							<h3 className="text-sm font-medium text-gray-600 mb-1">Total Invoices</h3>
							<p className="text-3xl font-bold text-gray-900">{totalInvoices || 0}</p>
						</div>
					</div>

					{/* Total Income */}
					<div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
						<div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full"></div>
						<div className="relative">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
									<Wallet className="w-6 h-6 text-white" />
								</div>
								<div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
									<TrendingUp className="w-3 h-3" />
									+8%
								</div>
							</div>
							<h3 className="text-sm font-medium text-gray-600 mb-1">Total Income</h3>
							<p className="text-3xl font-bold text-gray-900">
								Rp {totalAmount.toLocaleString("id-ID")}
							</p>
						</div>
					</div>

					{/* Total Products */}
					<div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
						<div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full"></div>
						<div className="relative">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
									<Package className="w-6 h-6 text-white" />
								</div>
								<div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
									Stable
								</div>
							</div>
							<h3 className="text-sm font-medium text-gray-600 mb-1">Total Products</h3>
							<p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
						</div>
					</div>

					{/* Paid Invoices */}
					<div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
						<div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full"></div>
						<div className="relative">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
									<CheckCircle className="w-6 h-6 text-white" />
								</div>
								<div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
									{Math.round((invoicesSuccess / totalInvoices) * 100)}%
								</div>
							</div>
							<h3 className="text-sm font-medium text-gray-600 mb-1">Paid Invoices</h3>
							<p className="text-3xl font-bold text-gray-900">{invoicesSuccess}</p>
						</div>
					</div>

					{/* Unpaid Invoices */}
					<div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-rose-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
						<div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full"></div>
						<div className="relative">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg">
									<AlertTriangle className="w-6 h-6 text-white" />
								</div>
								<div className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
									{Math.round((invoicesUnpaid / totalInvoices) * 100)}%
								</div>
							</div>
							<h3 className="text-sm font-medium text-gray-600 mb-1">Unpaid Invoices</h3>
							<p className="text-3xl font-bold text-gray-900">{invoicesUnpaid}</p>
						</div>
					</div>

					{/* Total Customers */}
					<div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
						<div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full"></div>
						<div className="relative">
							<div className="flex items-center justify-between mb-4">
								<div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
									<Users className="w-6 h-6 text-white" />
								</div>
								<div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
									<TrendingUp className="w-3 h-3" />
									+15%
								</div>
							</div>
							<h3 className="text-sm font-medium text-gray-600 mb-1">Total Customers</h3>
							<p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
						</div>
					</div>
				</div>

				<CustomerChart initialData={customerStats} />

				{/* Latest Invoices Section */}
				<div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100">
					<div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 mb-6">
						<div>
							<h2 className="text-xl sm:text-2xl font-bold text-gray-900">Latest Invoices</h2>
							<p className="text-xs sm:text-sm text-gray-500 mt-1">
								Recent transactions and status
							</p>
						</div>
						<Link href="/dashboard/invoices" className="shrink-0">
							<button className="text-[#8B2E1F] hover:text-[#6D2315] font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
								View All
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</Link>
					</div>

					<div className="space-y-2">
						{latestInvoices && latestInvoices.length > 0 ? (
							latestInvoices.map((inv) => (
								<div
									key={inv.id}
									className="group flex flex-col xs:flex-row xs:items-center justify-between bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-[#8B2E1F] rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-md cursor-pointer gap-4"
								>
									{/* Left Section */}
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#8B2E1F] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
											<FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
										</div>
										<div className="min-w-0">
											<p className="font-bold text-gray-900 text-base sm:text-lg truncate">
												#{inv.invoiceNumber}
											</p>
											<p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 truncate">
												<Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block shrink-0" />
												{toTitleCase(inv.buyerName)}
											</p>
										</div>
									</div>

									{/* Right Section */}
									<div className="flex xs:flex-col items-center xs:items-end justify-between xs:justify-start gap-2">
										<p className="font-bold text-lg sm:text-xl text-gray-900">
											Rp {inv.totalPrice.toLocaleString("id-ID")}
										</p>
										<span
											className={`text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1 sm:py-1.5 inline-flex items-center rounded-full ${getStatusVariant(
												inv.status
											)}`}
										>
											{toTitleCase(inv.status)}
										</span>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-12">
								<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<FileText className="w-10 h-10 text-gray-400" />
								</div>
								<p className="text-gray-500 font-medium">No invoice data available</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
