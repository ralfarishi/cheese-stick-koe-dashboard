import { unauthorized } from "next/navigation";

import InvoicePage from "./_components/InvoicePage";
import { createClient } from "@/lib/actions/supabase/server";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    unauthorized();
  }

  const { data: initialInvoices, error } = await supabase
    .from("Invoice")
    .select(
      "id, invoiceNumber, buyerName, totalPrice, invoiceDate, status, createdAt",
    )
    .order("invoiceNumber", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
  }

  return <InvoicePage initialData={initialInvoices || []} />;
}
