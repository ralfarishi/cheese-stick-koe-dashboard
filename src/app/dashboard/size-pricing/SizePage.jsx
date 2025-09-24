"use client";

import { useRef } from "react";

import SizePriceTable from "./_components/Table";
import AddSizeButton from "./_components/AddSizeButton";

export default function SizePage() {
	const tableRef = useRef();

	return (
		<section className="p-4 space-y-4">
			<div className="flex justify-between items-center mb-2">
				<h1 className="text-2xl font-bold text-[#6D2315] tracking-tight">Size & Price List</h1>
				<AddSizeButton
					onSizeAdded={() => {
						tableRef.current.refetch();
					}}
				/>
			</div>

			<SizePriceTable ref={tableRef} />
		</section>
	);
}
