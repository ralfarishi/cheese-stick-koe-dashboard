"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function getCustomerStats(year) {
  const supabase = await createClient();

  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year + 1}-01-01`);

  const { data, error } = await supabase
    .from("Invoice")
    .select("buyerName, invoiceDate")
    .eq("status", "success")
    .gte("invoiceDate", start.toISOString())
    .lt("invoiceDate", end.toISOString());

  if (error) {
    console.error("❌ Error fetching data:", error);
    return [];
  }

  // Map month data (1-12)
  const monthlyCustomers = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("en", { month: "short" }),
    totalCustomer: 0,
  }));

  data.forEach((invoice) => {
    const date = new Date(invoice.invoiceDate);
    const monthIndex = date.getMonth();
    const buyerKey = invoice.buyerName.trim().toLowerCase();

    if (!monthlyCustomers[monthIndex].buyers)
      monthlyCustomers[monthIndex].buyers = new Set();
    monthlyCustomers[monthIndex].buyers.add(buyerKey);
  });

  // Count unique customers per month
  monthlyCustomers.forEach((m) => {
    m.totalCustomer = m.buyers ? m.buyers.size : 0;
    delete m.buyers;
  });

  return monthlyCustomers;
}
