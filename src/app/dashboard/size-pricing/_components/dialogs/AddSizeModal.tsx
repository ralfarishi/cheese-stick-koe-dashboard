"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ProductSizePrice } from "@/lib/types";

import Modal from "@/components/dashboard/Modal";
import { addSize } from "@/lib/actions/size-price/addSize";

interface AddSizeModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess?: (sizePrice?: ProductSizePrice) => void;
}

interface SizeFormValues {
	size: string;
	price: string;
}

export default function AddSizeModal({ open, setOpen, onSuccess }: AddSizeModalProps) {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<SizeFormValues>({
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

	const sanitize = (str: string): string => {
		if (typeof str !== "string") return str;
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	const onSubmit = async (data: SizeFormValues): Promise<void> => {
		const sanitizedData = {
			size: sanitize(data.size),
			price: Number(data.price),
		};

		const { data: newSize, error } = await addSize(sanitizedData);

		if (error) {
			toast.error("Failed to add size & price: " + error);
		} else {
			toast.success("Size & price has been added");
			onSuccess?.(newSize as ProductSizePrice);
			setOpen(false);
			reset();
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={setOpen}
			title="Add New Size"
			color="terracotta"
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
			submitLabel={isSubmitting ? "Adding..." : "Create Size"}
		/>
	);
}
