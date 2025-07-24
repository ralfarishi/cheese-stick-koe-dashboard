"use client";

import { useState, useEffect } from "react";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Modal from "@/components/dashboard/Modal";

import { updateSize } from "@/lib/actions/size-price/updateSize";

import { toast } from "sonner";

export default function EditSizeModal({ open, onOpenChange, data, onSuccess }) {
	const [size, setSize] = useState("");
	const [price, setPrice] = useState("");

	useEffect(() => {
		if (data) {
			setSize(data.size || "");
			setPrice(data.price || "");
		}
	}, [data]);

	const handleUpdate = async () => {
		const result = await updateSize(data.id, { size, price });

		if (result?.success) {
			toast.success("Product has been updated");
			onSuccess?.({ ...data, size, price });
			onOpenChange(false);
		} else {
			toast.error(result?.message || "Failed to update size");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Size"
			color="blue"
			submitLabel="Update"
			showCancel={false}
		>
			<div className="space-y-2">
				<Input placeholder="Size name" value={size} onChange={(e) => setSize(e.target.value)} />
				<Input
					placeholder="Price"
					type="number"
					value={price}
					onChange={(e) => {
						const val = e.target.value;
						setPrice(val === "" ? "" : parseInt(val));
					}}
				/>
			</div>

			<DialogFooter className="pt-4">
				<Button onClick={handleUpdate} className="bg-sky-500 hover:bg-blue-500 w-full">
					Update
				</Button>
			</DialogFooter>
		</Modal>
	);
}
