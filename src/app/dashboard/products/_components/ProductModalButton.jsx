"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import ProductModal from "../ProductModal";

export default function ProductModalButton({ onProductAdded }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Add Product</Button>
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
