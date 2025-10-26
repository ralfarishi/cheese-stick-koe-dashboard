"use server";

import { createClient } from "@/lib/actions/supabase/server";

export const submitInvoice = async ({
  invoiceNumber,
  buyerName,
  invoiceDate,
  shippingPrice,
  discountAmount = 0,
  totalPrice,
  items,
  user,
}) => {
  if (!user) {
    return { error: "User is not login!" };
  }

  if (!invoiceNumber.trim() || !buyerName.trim() || items.length === 0) {
    return {
      error: "Invoice number, buyer name, and at least one item are required!",
    };
  }

  const supabase = await createClient();

  // validate number inputs
  const shipping = Number.isNaN(parseInt(shippingPrice))
    ? 0
    : parseInt(shippingPrice);
  const discount = Number.isNaN(parseInt(discountAmount))
    ? 0
    : parseInt(discountAmount);
  const total = Number.isNaN(parseInt(totalPrice)) ? 0 : parseInt(totalPrice);

  try {
    // is invoice number already exist?
    const { data: existing, error: checkError } = await supabase
      .from("Invoice")
      .select("id")
      .eq("invoiceNumber", invoiceNumber)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) return { error: "Invoice number already existed!" };

    // insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("Invoice")
      .insert([
        {
          invoiceNumber,
          buyerName,
          invoiceDate: new Date(invoiceDate),
          shipping,
          discount,
          totalPrice: total,
          status: "pending",
          userId: user.id,
        },
      ])
      .select()
      .single();

    if (invoiceError || !invoice)
      throw invoiceError || new Error("Failed to insert invoice!");

    // insert invoice items
    const invoiceItems = items.map((item) => ({
      invoiceId: invoice.id,
      productId: item.productId,
      sizePriceId: item.sizePriceId,
      quantity: item.quantity,
      subtotal: item.total,
      discountAmount: item.discountAmount || 0,
    }));

    const { error: itemError } = await supabase
      .from("InvoiceItem")
      .insert(invoiceItems);

    if (itemError) throw itemError;

    return { success: true, message: "Invoice has been created", invoice };
  } catch (err) {
    return { error: "Something went wrong while saving invoice!" };
  }
};
