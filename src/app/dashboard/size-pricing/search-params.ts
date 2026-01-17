import { parseAsInteger, parseAsString, createSearchParamsCache } from "nuqs/server";

export const sortByOptions = ["size", "price", "createdAt", "laborPercent"] as const;
export type SortByOption = (typeof sortByOptions)[number];

export const sortOrderOptions = ["asc", "desc"] as const;
export type SortOrderOption = (typeof sortOrderOptions)[number];

export const sizePricingParsers = {
	page: parseAsInteger.withDefault(1),
	sortBy: parseAsString.withDefault("size"),
	sortOrder: parseAsString.withDefault("asc"),
};

export const sizePricingSearchParamsCache = createSearchParamsCache(sizePricingParsers);
