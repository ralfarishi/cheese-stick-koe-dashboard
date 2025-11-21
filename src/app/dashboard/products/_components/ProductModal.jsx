"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Modal from "@/components/dashboard/Modal";

import { addProduct } from "@/lib/actions/products/addProduct";

import { toast } from "sonner";

export default function ProductModal({ open, setOpen, onSuccess }) {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
	});

	// Reset form when modal opens/closes
	useEffect(() => {
		if (open) {
			reset({ name: "", description: "" });
		}
	}, [open, reset]);

	const onSubmit = async (data) => {
		// sanitize inputs
		const sanitize = (str) => {
			return str
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		};

		const sanitizedData = {
			name: sanitize(data.name),
			description: sanitize(data.description || ""),
		};

		const { data: newProduct, error } = await addProduct(sanitizedData);

		if (error && error.message) {
			toast.error("Failed to add product: " + error.message);
		} else {
			toast.success("Product has been added");
			onSuccess?.(newProduct);
			setOpen(false);
			reset();
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
					name: "name",
					label: "Product Name",
					placeholder: "e.g. Cheese Stick Original",
					control: control,
					rules: {
						required: "Product name is required",
						minLength: {
							value: 3,
							message: "Product name must be at least 3 characters",
						},
						maxLength: {
							value: 100,
							message: "Product name must be less than 100 characters",
						},
						pattern: {
							value: /^[a-zA-Z\s]+$/,
							message: "Product name can only contain letters and spaces",
						},
					},
					error: errors.name,
				},
				{
					name: "description",
					label: "Description",
					placeholder: "Optional description...",
					control: control,
					rules: {
						maxLength: {
							value: 250,
							message: "Description must be less than 250 characters",
						},
					},
					error: errors.description,
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
