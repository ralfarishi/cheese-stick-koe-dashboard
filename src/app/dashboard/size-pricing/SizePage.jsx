"use client";

import SizePriceTable from "./_components/SizePriceTable";

export default function SizePage({ data, totalPages, totalCount }) {
  return (
    <div className="p-6">
      <SizePriceTable
        data={data}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}
