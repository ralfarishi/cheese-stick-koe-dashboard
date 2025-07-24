"use client";

import { useState } from "react";

import Modal from "@/components/dashboard/Modal";

import { addSize } from "@/lib/actions/size-price/addSize";

import { toast } from "sonner";

export default function AddSizeModal({ open, setOpen, onSuccess }) {
	const [size, setSize] = useState("");
	const [price, setPrice] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		const { data, error } = await addSize({ size, price });

		if (error && error.message) {
			toast.error("Failed to add size: " + error.message);
		} else {
			toast.success("Size has been added");
			onSuccess?.(data);
			setOpen(false);
			setSize("");
			setPrice("");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={setOpen}
			title="Add Size"
			color="default"
			fields={[
				{
					label: "Size name",
					value: size,
					onChange: (e) => setSize(e.target.value),
					required: true,
				},
				{
					type: "number",
					label: "Price",
					value: price === "" ? "" : Number(price),
					onChange: (e) => {
						const val = e.target.value;
						setPrice(val === "" ? "" : parseInt(val));
					},
					required: true,
				},
			]}
			onSubmit={handleSubmit}
			submitLabel="Add"
			showCancel={false}
			buttonStyling="bg-primary"
		/>
	);
}
