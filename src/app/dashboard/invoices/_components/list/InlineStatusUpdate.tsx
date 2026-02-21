"use client";

import { useOptimistic, useTransition } from "react";
import type { InvoiceStatus } from "@/lib/types";
import { toast } from "sonner";
import StatusCombobox from "./StatusCombobox";
import { updateInvoiceStatus } from "@/lib/actions/invoice/updateInvoiceStatus";

interface InlineStatusUpdateProps {
	invoiceId: string;
	currentStatus: InvoiceStatus;
}

export default function InlineStatusUpdate({ invoiceId, currentStatus }: InlineStatusUpdateProps) {
	const [isPending, startTransition] = useTransition();
	const [optimisticStatus, setOptimisticStatus] = useOptimistic(
		currentStatus,
		(state: InvoiceStatus, newStatus: InvoiceStatus) => newStatus,
	);

	const handleStatusChange = async (newStatus: InvoiceStatus): Promise<void> => {
		if (newStatus === optimisticStatus) return;

		startTransition(async () => {
			setOptimisticStatus(newStatus);
			try {
				const result = await updateInvoiceStatus(invoiceId, newStatus);

				if (result.success) {
					toast.success("Status updated successfully");
				} else {
					toast.error(result.error || "Failed to update status");
				}
			} catch {
				toast.error("An error occurred while updating status");
			}
		});
	};

	return (
		<div className="w-[140px]">
			<StatusCombobox value={optimisticStatus} onChange={handleStatusChange} disabled={isPending} />
		</div>
	);
}
