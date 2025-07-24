"use client";

import { useState } from "react";

import Modal from "@/components/dashboard/Modal";

import { addProduct } from "@/lib/actions/products/addProduct";

import { toast } from "sonner";

export default function ProductModal({ open, setOpen, onSuccess }) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		const { data, error } = await addProduct({ name, description });

		if (error && error.message) {
			toast.error("Failed to add product: " + error.message);
		} else {
			toast.success("Product has been added");
			onSuccess?.(data);
			setOpen(false);
			setName("");
			setDescription("");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={setOpen}
			title="Add Product"
			color="default"
			fields={[
				{
					label: "Product Name",
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true,
				},
				{
					label: "Description",
					value: description,
					onChange: (e) => setDescription(e.target.value),
				},
			]}
			onSubmit={handleSubmit}
			submitLabel="Add"
			showCancel={false}
			buttonStyling="bg-primary"
		/>
		// <Dialog open={open} onOpenChange={setOpen}>
		// 	<DialogContent>
		// 		<DialogHeader>
		// 			<DialogTitle>Add Product</DialogTitle>
		// 		</DialogHeader>

		// 		<form onSubmit={handleSubmit} className="space-y-4 mt-4">
		// 			<div className="space-y-1">
		// 				<Label>Product Name</Label>
		// 				<Input value={name} onChange={(e) => setName(e.target.value)} required />
		// 			</div>
		// 			<div className="space-y-1">
		// 				<Label>Description (optional)</Label>
		// 				<Input value={description} onChange={(e) => setDescription(e.target.value)} />
		// 			</div>
		// 			<Button type="submit" className="w-full mt-2">
		// 				Add
		// 			</Button>
		// 		</form>
		// 	</DialogContent>
		// </Dialog>
	);
}
