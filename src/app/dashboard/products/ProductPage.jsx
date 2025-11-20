"use client";

import ProductTable from "./_components/ProductTable";

export default function ProductPage({ products, totalPages, totalCount }) {
  return (
    <div className="p-6">
      <ProductTable
        products={products}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}
