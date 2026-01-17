"use client";

import type { Product } from "@/lib/types";
import ProductTable from "./_components/ProductTable";

interface ProductPageProps {
	products: Product[];
	totalPages: number;
	totalCount: number;
}

export default function ProductPage({ products, totalPages, totalCount }: ProductPageProps) {
	return (
		<div className="p-6">
			<ProductTable products={products} totalPages={totalPages} totalCount={totalCount} />
		</div>
	);
}

