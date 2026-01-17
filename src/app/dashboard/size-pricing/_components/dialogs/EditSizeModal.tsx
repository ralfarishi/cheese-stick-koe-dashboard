"use client";

import { useState, useEffect } from "react";
import type { ProductSizePrice } from "@/lib/types";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Modal from "@/components/dashboard/Modal";

import { updateSize } from "@/lib/actions/size-price/updateSize";

import { toast } from "sonner";

interface EditSizeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: ProductSizePrice | null;
	onSuccess?: (sizePrice: ProductSizePrice) => void;
}

export default function EditSizeModal({ open, onOpenChange, data, onSuccess }: EditSizeModalProps) {
	const [size, setSize] = useState<string>("");
	const [price, setPrice] = useState<string>("");

	useEffect(() => {
		if (data) {
			setSize(data.size || "");
			setPrice(String(data.price) || "");
		}
	}, [data]);

	const handleUpdate = async (): Promise<void> => {
		if (!data) return;

		const result = await updateSize(data.id, { size, price, laborPercent: data.laborPercent ?? 0 });

		if (result?.success) {
			toast.success("Size has been updated");
			onSuccess?.({ ...data, size, price: Number(price) });
			onOpenChange(false);
		} else {
			toast.error(result?.message || "Failed to update size");
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			title="Edit Size & Pricing"
			color="terracotta"
			submitLabel="Update"
		>
			<div className="space-y-4 py-4">
				<div className="space-y-2">
					<label className="text-[10px] font-bold uppercase tracking-widest text-[#8B2E1F]/60 px-1">
						Size Name
					</label>
					<Input
						placeholder="Size name"
						value={size}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSize(e.target.value)}
						className="h-12 px-4 border-2 border-transparent bg-[#FCF9F1] rounded-xl focus:bg-white focus:border-[#8B2E1F] focus:ring-0 transition-all duration-300 text-[#2D2424] font-medium placeholder:text-gray-300 shadow-none outline-none"
					/>
				</div>
				<div className="space-y-2">
					<label className="text-[10px] font-bold uppercase tracking-widest text-[#8B2E1F]/60 px-1">
						Price
					</label>
					<Input
						placeholder="Price"
						type="number"
						value={price}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							const val = e.target.value;
							setPrice(val);
						}}
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
