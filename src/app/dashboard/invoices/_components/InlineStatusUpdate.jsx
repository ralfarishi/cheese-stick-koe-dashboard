"use client";

import { useState } from "react";
import { toast } from "sonner";
import StatusCombobox from "./StatusCombobox";
import { updateInvoiceStatus } from "@/lib/actions/invoice/updateInvoiceStatus";

export default function InlineStatusUpdate({ invoiceId, currentStatus }) {
	const [status, setStatus] = useState(currentStatus);
	const [isLoading, setIsLoading] = useState(false);

	const handleStatusChange = async (newStatus) => {
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
		} catch (error) {
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
