"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import Modal from "@/components/dashboard/Modal";

import { deleteInvoice } from "@/lib/actions/invoice/deleteInvoice";

import { toast } from "sonner";

export default function DeleteInvoiceModal({ open, onOpenChange, invoiceId, onSuccess }) {
	const handleDelete = async () => {
		if (!invoiceId) {
			toast.error("Invoice ID not found");
			return;
		}

		const result = await deleteInvoice(invoiceId);

		if (result?.success) {
			toast.success("Invoice has been deleted");
			onSuccess?.();
			onOpenChange(false);
		} else {
			toast.error(result?.message || "Failed to delete invoice");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Invoice"
			color="red"
			submitLabel="Delete"
			showCancel={false}
		>
			<p>Are you sure want to delete this invoice?</p>
			<DialogFooter className="flex flex-wrap items-center gap-2 md:flex-row">
				<Button
					variant="destructive"
					onClick={handleDelete}
					className="bg-rose-600 hover:bg-red-600 w-24"
				>
					Delete
				</Button>
			</DialogFooter>
		</Modal>
	);
}
