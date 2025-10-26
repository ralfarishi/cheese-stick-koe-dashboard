"use client";

import { useRef } from "react";

import ProductTable from "./_components/ProductTable";

export default function ProductPage() {
  const tableRef = useRef();

  return <ProductTable ref={tableRef} />;
}
