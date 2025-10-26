import { supabaseBrowser } from "@/lib/actions/supabase/browser";

export async function getInvoiceWithItems(invoiceId) {
  const supabase = supabaseBrowser();

  const { data: invoice, error: err1 } = await supabase
    .from("Invoice")
    .select("*")
    .eq("id", invoiceId)
    .single();

  const { data: items, error: err2 } = await supabase
    .from("InvoiceItem")
    .select("*, product:Product(name), size:ProductSizePrice(size)")
    .eq("invoiceId", invoiceId);

  return { invoice, items };
}
