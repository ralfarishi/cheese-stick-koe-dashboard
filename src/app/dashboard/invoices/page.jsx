"use client";

import { useRef } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import InvoicesTable from "./Table";

export default function InvoicePage() {
	const tableRef = useRef();

	return (
		<section className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl font-bold">Invoices List</h1>
				<Button asChild>
					<Link href="/dashboard/invoices/create">Create Invoice</Link>
				</Button>
			</div>

			<InvoicesTable ref={tableRef} />
		</section>
	);
}
