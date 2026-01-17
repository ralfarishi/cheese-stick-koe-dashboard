"use client";

import { memo } from "react";
import type { Invoice } from "@/lib/types";
import InvoiceList from "./InvoiceList";

interface InvoicePageProps {
	invoices: Invoice[];
	totalPages: number;
	totalCount: number;
}

function InvoicePage({ invoices, totalPages, totalCount }: InvoicePageProps) {
	return (
		<div className="p-6">
			<InvoiceList invoices={invoices} totalPages={totalPages} totalCount={totalCount} />
		</div>
	);
}

export default memo(InvoicePage);

