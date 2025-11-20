"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getAllProducts = cache(
  async ({ page = 1, limit = 10, query = "", sortOrder = "asc" } = {}) => {
    const supabase = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase
      .from("Product")
      .select("id, name, description, createdAt", { count: "exact" })
      .order("name", { ascending: sortOrder === "asc" })
      .range(from, to);

    if (query) {
      dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data, error, count } = await dbQuery;

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return { data, error, count, totalPages };
  },
);
