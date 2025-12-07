"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteSize } from "@/lib/actions/size-price/deleteSize";
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal";

export default function DeleteSizeModal({ open, onOpenChange, sizeId, sizeName, onSuccess }) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!sizeId) {
			toast.error("Size ID not found");
			return;
		}

		setIsDeleting(true);
		try {
			const result = await deleteSize(sizeId);

			if (result?.success) {
				toast.success("Size has been deleted");
				onSuccess?.();
				onOpenChange(false);
			} else {
				toast.error(result?.message || "Failed to delete size");
			}
		} catch (error) {
			toast.error("An error occurred while deleting size");
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
			title="Delete Size"
			description={
				<span>
					Are you sure you want to delete size <span className="font-bold">{sizeName}</span>? This
					action cannot be undone.
				</span>
			}
		/>
	);
}
