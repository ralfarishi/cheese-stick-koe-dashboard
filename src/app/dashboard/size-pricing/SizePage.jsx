"use client";

import { useRef } from "react";

import SizePriceTable from "./_components/Table";

export default function SizePage() {
  const tableRef = useRef();

  return <SizePriceTable ref={tableRef} />;
}
