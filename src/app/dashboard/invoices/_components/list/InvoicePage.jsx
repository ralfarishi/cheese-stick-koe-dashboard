"use client";

import { memo } from "react";
import InvoiceList from "./InvoiceList";

function InvoicePage({ invoices, totalPages, totalCount }) {
  return (
    <div className="p-6">
      <InvoiceList
        invoices={invoices}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}

export default memo(InvoicePage);
