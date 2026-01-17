"use client";

import { useState } from "react";
import type { InvoiceStatus } from "@/lib/types";
import { toast } from "sonner";
import StatusCombobox from "./StatusCombobox";
import { updateInvoiceStatus } from "@/lib/actions/invoice/updateInvoiceStatus";

interface InlineStatusUpdateProps {
	invoiceId: string;
	currentStatus: InvoiceStatus;
}

export default function InlineStatusUpdate({ invoiceId, currentStatus }: InlineStatusUpdateProps) {
	const [status, setStatus] = useState<InvoiceStatus>(currentStatus);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleStatusChange = async (newStatus: InvoiceStatus): Promise<void> => {
		if (newStatus === status) return;

		// Optimistic update
		const previousStatus = status;
		setStatus(newStatus);
		setIsLoading(true);

		try {
			const result = await updateInvoiceStatus(invoiceId, newStatus);

			if (result.success) {
				toast.success("Status updated successfully");
			} else {
				// Revert on failure
				setStatus(previousStatus);
				toast.error(result.error || "Failed to update status");
			}
		} catch {
			setStatus(previousStatus);
			toast.error("An error occurred while updating status");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-[140px]">
			<StatusCombobox value={status} onChange={handleStatusChange} disabled={isLoading} />
		</div>
	);
}
