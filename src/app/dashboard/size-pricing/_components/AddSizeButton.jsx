"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import AddSizeModal from "../AddSizeModal";

export default function AddSizeButton({ onSizeAdded }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Add Size</Button>
			<AddSizeModal
				open={open}
				setOpen={setOpen}
				onSuccess={() => {
					onSizeAdded?.();
				}}
			/>
		</>
	);
}
