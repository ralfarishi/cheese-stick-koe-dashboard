import Link from "next/link";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabaseServer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getPageTitle, getStatusVariant, toTitleCase } from "@/lib/utils";
import { AlertTriangle, CheckCircle, FileText, Package, Users, Wallet } from "lucide-react";

export const metadata = {
	title: getPageTitle("Dashboard"),
};

export default async function Dashboard() {
	const supabase = await supabaseServer();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/");
	}

	// const user = session.user;

	// get total invoice
	const { count: totalInvoices } = await supabase
		.from("Invoice")
		.select("*", { count: "exact", head: true });

	// get total products
	const { count: totalProducts } = await supabase
		.from("Product")
		.select("*", { count: "exact", head: true });

	// get latest invoice data
	const { data: invoices } = await supabase
		.from("Invoice")
		.select("id, invoiceNumber, buyerName, totalPrice, status, createdAt")
		.order("createdAt", { ascending: false })
		.limit(5);

	// count paid invoices
	const { count: invoicesSuccess } = await supabase
		.from("Invoice")
		.select("id", { count: "exact" })
		.eq("status", "success");

	// count unpaid invoices
	const { count: invoicesUnpaid } = await supabase
		.from("Invoice")
		.select("id", { count: "exact" })
		.eq("status", "pending");

	// count total customers (unique)
	const { data } = await supabase.from("Invoice").select("buyerName");

	const uniqueCustomers = new Set(data.map((d) => d.buyerName.trim().toLowerCase()));

	const totalCustomers = uniqueCustomers.size;

	const totalAmount =
		invoices
			?.filter((inv) => inv.status === "success")
			.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;

	return (
		<div className="grid gap-6">
			{/* Welcome Card */}
			<Card className="bg-[#fffaf0] border border-[#f4e3d3] shadow-sm">
				<CardHeader>
					<CardTitle className="text-xl text-[#6D2315] font-bold">Welcome back, Admin 👋</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-gray-600">Manage your dashboard here.</p>
					<div className="mt-4">
						<Link href="/dashboard/invoices/create">
							<Button className="bg-[#6D2315] hover:bg-[#591c10] text-white">
								+ Create Invoice
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Statistik Ringkas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{/* Total Invoices */}
				<Card className="bg-[#fef6f3] border-0 shadow-sm text-[#6D2315]">
					<CardHeader>
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<FileText className="w-4 h-4 text-[#6D2315]" />
							Total Invoices
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{totalInvoices || 0}</p>
					</CardContent>
				</Card>

				{/* Total Income */}
				<Card className="bg-[#fdf2e9] border-0 shadow-sm text-[#92400e]">
					<CardHeader>
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Wallet className="w-4 h-4 text-[#92400e]" />
							Total Income
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">Rp {totalAmount.toLocaleString("id-ID")}</p>
					</CardContent>
				</Card>

				{/* Total Products */}
				<Card className="bg-[#fef9e7] border-0 shadow-sm text-[#92400e]">
					<CardHeader>
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Package className="w-4 h-4 text-[#92400e]" />
							Total Products
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{totalProducts}</p>
					</CardContent>
				</Card>

				{/* Paid Invoices */}
				<Card className="bg-[#f0f9f5] border-0 shadow-sm text-[#065f46]">
					<CardHeader>
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<CheckCircle className="w-4 h-4 text-[#065f46]" />
							Paid Invoices
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{invoicesSuccess}</p>
					</CardContent>
				</Card>

				{/* Unpaid Invoices */}
				<Card className="bg-[#fef2f2] border-0 shadow-sm text-[#991b1b]">
					<CardHeader>
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<AlertTriangle className="w-4 h-4 text-[#991b1b]" />
							Unpaid Invoices
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{invoicesUnpaid}</p>
					</CardContent>
				</Card>

				{/* Total Customers */}
				<Card className="bg-[#e8f0fe] border-0 shadow-sm text-[#1e3a8a]">
					<CardHeader>
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Users className="w-4 h-4 text-[#1e3a8a]" />
							Total Customers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{totalCustomers}</p>
					</CardContent>
				</Card>
			</div>

			{/* Latest Invoices */}
			<Card className="bg-white border border-[#f4e3d3] shadow-sm">
				<CardHeader>
					<CardTitle className="text-[#6D2315] font-medium">Latest Invoices</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3">
					{invoices && invoices.length > 0 ? (
						invoices.map((inv) => (
							<div
								key={inv.id}
								className="flex items-center justify-between bg-[#fefaf7] hover:bg-[#fff3ec] transition-colors duration-150 border border-[#fceee4] rounded-md p-3"
							>
								{/* Left Section: Icon + Info */}
								<div className="flex items-center gap-3">
									<div className="bg-[#fdf0e6] text-[#6D2315] p-2 rounded-md">
										<FileText className="w-5 h-5" />
									</div>
									<div>
										<p className="font-medium text-gray-800">Invoice #{inv.invoiceNumber}</p>
										<p className="text-sm text-gray-500">{toTitleCase(inv.buyerName)}</p>
									</div>
								</div>

								{/* Right Section: Amount + Status */}
								<div className="text-right space-y-1">
									<p className="font-semibold text-gray-800">
										Rp {inv.totalPrice.toLocaleString("id-ID")}
									</p>
									<span className={getStatusVariant(inv.status)}>{toTitleCase(inv.status)}</span>
								</div>
							</div>
						))
					) : (
						<p className="text-sm text-gray-500">Belum ada invoice.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
