"use client";

import { useRef } from "react";

import ProductModalButton from "./ProductModalButton";
import ProductTable from "../ProductTable";

export default function ProductPage() {
	const tableRef = useRef();

	return (
		<section className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl font-bold">Product List</h1>
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
