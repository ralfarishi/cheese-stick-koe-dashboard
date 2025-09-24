"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import ProductModal from "./ProductModal";

export default function ProductModalButton({ onProductAdded }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				className="bg-[#6D2315] hover:bg-[#591c10] text-white px-4 py-2 rounded-md"
			>
				Add Product
			</Button>
			<ProductModal
				open={open}
				setOpen={setOpen}
				onSuccess={() => {
					onProductAdded?.();
				}}
			/>
		</>
	);
}
