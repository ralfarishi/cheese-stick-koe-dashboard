"use client";

import { toast } from "sonner";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import Modal from "@/components/dashboard/Modal";

import { deleteSize } from "@/lib/actions/size-price/deleteSize";

export default function DeleteSizeModal({ open, onOpenChange, sizeId, onSuccess }) {
	const handleDelete = async () => {
		const result = await deleteSize(sizeId);

		if (result?.success) {
			toast.success("Size has been deleted");
			onSuccess?.();
			onOpenChange(false);
		} else {
			toast.error(result?.message || "Failed to delete size");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Size"
			color="red"
			submitLabel="Delete"
			showCancel={false}
		>
			<p>Are you sure want to delete this size?</p>
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
	);
}
