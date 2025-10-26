"use client";

import { useRef } from "react";

import InvoicesTable from "./InvoiceList";

export default function InvoicePage() {
  const tableRef = useRef();

  return <InvoicesTable ref={tableRef} />;
}
