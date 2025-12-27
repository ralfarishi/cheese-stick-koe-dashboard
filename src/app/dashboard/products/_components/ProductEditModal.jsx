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
			color="terracotta"
			submitLabel="Update"
			showCancel={false}
		>
			<div className="space-y-4 py-4">
				<div className="space-y-2">
					<label className="text-[10px] font-bold uppercase tracking-widest text-[#8B2E1F]/60 px-1">
						Product Name
					</label>
					<Input
						placeholder="Product name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="h-12 px-4 border-2 border-transparent bg-[#FCF9F1] rounded-xl focus:bg-white focus:border-[#8B2E1F] focus:ring-0 transition-all duration-300 text-[#2D2424] font-medium placeholder:text-gray-300 shadow-none outline-none"
					/>
				</div>
				<div className="space-y-2">
					<label className="text-[10px] font-bold uppercase tracking-widest text-[#8B2E1F]/60 px-1">
						Description
					</label>
					<Input
						placeholder="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="h-12 px-4 border-2 border-transparent bg-[#FCF9F1] rounded-xl focus:bg-white focus:border-[#8B2E1F] focus:ring-0 transition-all duration-300 text-[#2D2424] font-medium placeholder:text-gray-300 shadow-none outline-none"
					/>
				</div>
			</div>

			<DialogFooter className="pt-6">
				<Button
					onClick={handleUpdate}
					className="bg-[#8B2E1F] hover:bg-[#6D2315] text-white w-full h-14 rounded-xl font-bold text-base shadow-[0_8px_16px_-4px_rgba(139,46,31,0.2)] hover:shadow-[0_12px_20px_-4px_rgba(139,46,31,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
				>
					Save Changes
				</Button>
			</DialogFooter>
		</Modal>
	);
}
