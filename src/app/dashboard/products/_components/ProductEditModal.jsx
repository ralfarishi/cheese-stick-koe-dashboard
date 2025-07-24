"use client";

import { useState, useEffect } from "react";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Modal from "@/components/dashboard/Modal";

import { updateProduct } from "@/lib/actions/products/updateProduct";

import { toast } from "sonner";

export default function ProductEditModal({ open, onOpenChange, product, onSuccess }) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		if (product) {
			setName(product.name || "");
			setDescription(product.description || "");
		}
	}, [product]);

	const handleUpdate = async () => {
		const result = await updateProduct(product.id, { name, description });

		if (result?.success) {
			toast.success("Product has been updated");
			onSuccess?.({ ...product, name, description });
			onOpenChange(false);
		} else {
			toast.error(result?.message || "Failed to update product");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Product"
			color="blue"
			submitLabel="Update"
			showCancel={false}
		>
			<div className="space-y-2">
				<Input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
				<Input
					placeholder="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
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
