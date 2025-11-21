"use client";

import Modal from "@/components/dashboard/Modal";

import { addSize } from "@/lib/actions/size-price/addSize";

import { toast } from "sonner";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function AddSizeModal({ open, setOpen, onSuccess }) {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			size: "",
			price: "",
		},
	});

	useEffect(() => {
		if (open) {
			reset({ size: "", price: "" });
		}
	}, [open, reset]);

	const onSubmit = async (data) => {
		// sanitize inputs
		const sanitize = (str) => {
			if (typeof str !== "string") return str;
			return str
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		};

		const sanitizedData = {
			size: sanitize(data.size),
			price: Number(data.price), // Ensure price is a number
		};

		const { data: newProduct, error } = await addSize(sanitizedData);

		if (error && error.message) {
			toast.error("Failed to add size & price: " + error.message);
		} else {
			toast.success("Size & price has been added");
			onSuccess?.(newProduct);
			setOpen(false);
			reset();
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
					name: "size",
					label: "Size Name",
					placeholder: "e.g. 1 kg",
					control: control,
					rules: {
						required: "Size name is required",
						minLength: {
							value: 3,
							message: "Size name must be at least 3 characters",
						},
						maxLength: {
							value: 50,
							message: "Size name must be less than 50 characters",
						},
						pattern: {
							value: /^[a-zA-Z0-9\s\/-]+$/,
							message:
								"Size name can only contain letters, numbers, spaces, forward slashes, and hyphens",
						},
					},
					error: errors.size,
				},
				{
					name: "price",
					label: "Price",
					placeholder: "e.g. 10000",
					type: "number",
					control: control,
					rules: {
						required: "Price is required",
						min: {
							value: 1000,
							message: "Price must be at least 1000",
						},
					},
					error: errors.price,
				},
			]}
			onSubmit={handleSubmit(onSubmit)}
			submitLabel={isSubmitting ? "Adding..." : "Add"}
			isSubmitting={isSubmitting}
			showCancel={false}
			buttonStyling="bg-primary"
		/>
	);
}
