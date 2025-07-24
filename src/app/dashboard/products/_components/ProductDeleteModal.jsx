"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import Modal from "@/components/dashboard/Modal";

import { deleteProduct } from "@/lib/actions/products/deleteProduct";

import { toast } from "sonner";

export default function ProductDeleteModal({ open, onOpenChange, productId, onSuccess }) {
	const handleDelete = async () => {
		const result = await deleteProduct(productId);

		if (result?.success) {
			toast.success("Product has been deleted");
			onSuccess?.();
			onOpenChange(false);
		} else {
			toast.error(result?.message || "Failed to delete product");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Product"
			color="red"
			submitLabel="Delete"
			showCancel={false}
		>
			<p>Are you sure want to delete this product?</p>
			<DialogFooter>
				<Button
					variant="destructive"
					onClick={handleDelete}
					className={"bg-rose-600 hover:bg-red-600 w-24"}
				>
					Delete
				</Button>
			</DialogFooter>
		</Modal>

		// <Dialog open={open} onOpenChange={onOpenChange}>
		// 	<DialogContent>
		// 		<DialogHeader>
		// 			<DialogTitle className={"text-red-500"}>Delete Product</DialogTitle>
		// 		</DialogHeader>
		// 		<p>Are you sure want to delete this product?</p>
		// 		<DialogFooter>
		// 			<Button variant="outline" onClick={() => onOpenChange(false)}>
		// 				Cancel
		// 			</Button>
		// 			<Button
		// 				variant="destructive"
		// 				onClick={handleDelete}
		// 				className={"bg-rose-600 hover:bg-red-600"}
		// 			>
		// 				Delete
		// 			</Button>
		// 		</DialogFooter>
		// 	</DialogContent>
		// </Dialog>
	);
}
