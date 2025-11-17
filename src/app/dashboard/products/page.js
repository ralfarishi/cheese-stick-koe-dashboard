import { unauthorized } from "next/navigation";

import { getPageTitle } from "@/lib/utils";
import { createClient } from "@/lib/actions/supabase/server";

import ProductPage from "./ProductPage";

export const metadata = {
  title: getPageTitle("Products"),
};

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    unauthorized();
  }

  const { data: initialProducts } = await supabase
    .from("Product")
    .select("id, name, description, createdAt")
    .order("name", { ascending: true })
    .limit(10);

  return <ProductPage initialData={initialProducts || []} />;
}
