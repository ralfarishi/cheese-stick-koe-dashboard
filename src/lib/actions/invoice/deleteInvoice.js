"use server";

import { createClient } from "@/lib/actions/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteInvoice(invoiceId) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("Invoice")
      .delete()
      .match({ id: invoiceId });

    if (error) {
      console.error("❌ Supabase delete error:", error);
      return { success: false, message: "Failed to delete invoice" };
    }

    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Failed to delete invoice" };
  }
}
