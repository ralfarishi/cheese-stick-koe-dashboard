"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteProduct } from "@/lib/actions/products/deleteProduct";
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal";

export default function ProductDeleteModal({
	open,
	onOpenChange,
	productId,
	productName,
	onSuccess,
}) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!productId) {
			toast.error("Product ID not found");
			return;
		}

		setIsDeleting(true);
		try {
			const result = await deleteProduct(productId);

			if (result?.success) {
				toast.success("Product has been deleted");
				onSuccess?.();
				onOpenChange(false);
			} else {
				toast.error(result?.message || "Failed to delete product");
			}
		} catch (error) {
			toast.error("An error occurred while deleting product");
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
			title="Delete Product"
			description={
				<span>
					Are you sure you want to delete <span className="font-bold">{productName}</span>? This
					action cannot be undone.
				</span>
			}
		/>
	);
}
