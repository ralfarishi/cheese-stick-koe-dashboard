"use client";

import { useRef, memo } from "react";
import InvoicesTable from "./InvoiceList";

function InvoicePage({ initialData }) {
  const tableRef = useRef();

  return <InvoicesTable ref={tableRef} initialData={initialData} />;
}

export default memo(InvoicePage);
