"use client";

import { useRef } from "react";

import ProductModalButton from "./ProductModalButton";
import ProductTable from "../ProductTable";

export default function ProductPage() {
	const tableRef = useRef();

	return (
		<section className="p-4 space-y-4">
			<div className="flex justify-between items-center mb-2">
				<h1 className="text-2xl font-bold text-[#6D2315] tracking-tight">Product List</h1>
				<ProductModalButton
					onProductAdded={() => {
						tableRef.current?.refetch();
					}}
				/>
			</div>

			<ProductTable ref={tableRef} />
		</section>
	);
}
