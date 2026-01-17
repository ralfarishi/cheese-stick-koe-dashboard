"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { deleteProduct } from "@/lib/actions/products/deleteProduct";
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal";

interface ProductDeleteModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	productId: string | undefined;
	productName: string | undefined;
	onSuccess?: () => void;
}

export default function ProductDeleteModal({
	open,
	onOpenChange,
	productId,
	productName,
	onSuccess,
}: ProductDeleteModalProps) {
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	const handleDelete = async (): Promise<void> => {
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
		} catch {
			toast.error("An error occurred while deleting product");
		} finally {
			setIsDeleting(false);
		}
	};

	const description: ReactNode = (
		<span>
			Are you sure you want to delete <span className="font-bold">{productName}</span>? This action
			cannot be undone.
		</span>
	);

	return (
		<DeleteConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			onConfirm={handleDelete}
			isDeleting={isDeleting}
			title="Delete Product"
			description={description as unknown as string}
		/>
	);
}
