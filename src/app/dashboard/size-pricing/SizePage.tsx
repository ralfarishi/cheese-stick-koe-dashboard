"use client";

import type { ProductSizePrice } from "@/lib/types";
import SizePriceTable from "./_components/listing/SizePriceTable";

interface SizePageProps {
	data: ProductSizePrice[];
	totalPages: number;
	totalCount: number;
}

export default function SizePage({ data, totalPages, totalCount }: SizePageProps) {
	return (
		<div className="p-6">
			<SizePriceTable data={data} totalPages={totalPages} totalCount={totalCount} />
		</div>
	);
}

