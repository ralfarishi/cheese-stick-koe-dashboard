"use client";

import { useRef } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import InvoicesTable from "./Table";

export default function InvoicePage() {
	const tableRef = useRef();

	return (
		<section className="p-4 space-y-4">
			<div className="flex justify-between items-center mb-2">
				<h1 className="text-2xl font-bold text-[#6D2315] tracking-tight">Invoices List</h1>
				<Button asChild className="bg-[#6D2315] hover:bg-[#591c10] text-white px-4 py-2 rounded-md">
					<Link href="/dashboard/invoices/create">Create Invoice</Link>
				</Button>
			</div>

			<InvoicesTable ref={tableRef} />
		</section>
	);
}
