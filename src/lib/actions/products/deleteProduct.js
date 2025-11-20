"use server";

import { createClient } from "@/lib/actions/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("Product")
      .delete()
      .match({ id: productId });

    if (error) {
      console.error("❌ Supabase delete error:", error);
      return { success: false, message: "Failed to delete product" };
    }

    revalidatePath("/dashboard/products");

    return { success: true };
  } catch (err) {
    console.error("Error deleting product:", err);
    return { success: false, message: "Failed to delete product" };
  }
}
