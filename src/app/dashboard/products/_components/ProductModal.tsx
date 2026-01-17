"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Product } from "@/lib/types";

import Modal from "@/components/dashboard/Modal";

import { addProduct } from "@/lib/actions/products/addProduct";

import { toast } from "sonner";

interface ProductModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess?: (product?: Product) => void;
}

interface ProductFormValues {
	name: string;
	description: string;
}

export default function ProductModal({ open, setOpen, onSuccess }: ProductModalProps) {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProductFormValues>({
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

	const sanitize = (str: string): string => {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	const onSubmit = async (data: ProductFormValues): Promise<void> => {
		const sanitizedData = {
			name: sanitize(data.name),
			description: sanitize(data.description || ""),
		};

		const { data: newProduct, error } = await addProduct(sanitizedData);

		if (error) {
			toast.error("Failed to add product: " + error);
		} else {
			toast.success("Product has been added");
			onSuccess?.(newProduct as Product);
			setOpen(false);
			reset();
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={setOpen}
			title="Add Product"
			color="terracotta"
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
			submitLabel={isSubmitting ? "Adding..." : "Create Product"}
		/>
	);
}
