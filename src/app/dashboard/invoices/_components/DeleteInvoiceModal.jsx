"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteInvoice } from "@/lib/actions/invoice/deleteInvoice";
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal";

export default function DeleteInvoiceModal({
	open,
	onOpenChange,
	invoiceId,
	invoiceNumber,
	onSuccess,
}) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!invoiceId) {
			toast.error("Invoice ID not found");
			return;
		}

		setIsDeleting(true);
		try {
			const result = await deleteInvoice(invoiceId);

			if (result?.success) {
				toast.success("Invoice has been deleted");
				onSuccess?.();
				onOpenChange(false);
			} else {
				toast.error(result?.message || "Failed to delete invoice");
			}
		} catch (error) {
			toast.error("An error occurred while deleting invoice");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<DeleteConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			onConfirm={handleDelete}
			isDeleting={isDeleting}
			title={`Invoice #${invoiceNumber}`}
			description="Are you sure want to delete this invoice? This action cannot be undone."
		/>
	);
}
