"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getAllInvoice = cache(async (sortOrder = "asc") => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoice")
    .select(
      "id, invoiceNumber, buyerName, totalPrice, invoiceDate, status, createdAt",
    )
    .order("invoiceNumber", { ascending: sortOrder === "asc" });

  return { data, error };
});
