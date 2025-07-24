import Link from "next/link";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabaseServer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getPageTitle, getStatusVariant, toTitleCase } from "@/lib/utils";

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

	// get total invoice + latest invoice data
	const { count: totalInvoices } = await supabase
		.from("Invoice")
		.select("*", { count: "exact", head: true });

	const { data: invoices } = await supabase
		.from("Invoice")
		.select("id, invoiceNumber, buyerName, totalPrice, status, createdAt")
		.order("createdAt", { ascending: false })
		.limit(5);

	const totalAmount =
		invoices
			?.filter((inv) => inv.status === "success")
			.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;

	return (
		<div className="grid gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Welcome back, Admin 👋</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Manage your dashboard here.</p>
					<div className="mt-4">
						<Link href="/dashboard/invoices/create">
							<Button variant="default">+ Create Invoice</Button>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Statistik Ringkas */}
			<div className="grid grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Total Invoice</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{totalInvoices || 0}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Total Income</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">Rp {totalAmount.toLocaleString("id-ID")}</p>
					</CardContent>
				</Card>
			</div>

			{/* List Invoice Terbaru */}
			<Card>
				<CardHeader>
					<CardTitle>Latest Invoice</CardTitle>
				</CardHeader>
				<CardContent>
					{invoices && invoices.length > 0 ? (
						<ul className="space-y-3">
							{invoices.map((inv) => (
								<li key={inv.id} className="flex items-center justify-between border-b pb-2">
									<div>
										<p className="font-medium">Invoice No. {inv.invoiceNumber}</p>
										<p className="text-sm text-muted-foreground">{toTitleCase(inv.buyerName)}</p>
									</div>
									<div className="text-right">
										<p className="font-medium">Rp {inv.totalPrice.toLocaleString("id-ID")}</p>
										<span className={getStatusVariant(inv.status)}>{toTitleCase(inv.status)}</span>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-muted-foreground">Belum ada invoice.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
