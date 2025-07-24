"use client";

import { useRef } from "react";

import SizePriceTable from "../Table";
import AddSizeButton from "./AddSizeButton";

export default function SizePage() {
	const tableRef = useRef();

	return (
		<section className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl font-bold">Size and Price List</h1>
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
