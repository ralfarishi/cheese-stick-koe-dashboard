"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function getAllInvoice(sortOrder = "asc") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoice")
    .select(
      "id, invoiceNumber, buyerName, totalPrice, invoiceDate, status, createdAt",
    )
    .order("invoiceNumber", { ascending: sortOrder === "asc" });

  return { data, error };
}
