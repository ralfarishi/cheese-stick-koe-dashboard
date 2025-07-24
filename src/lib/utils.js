import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function getStatusVariant(status) {
	switch (status) {
		case "success":
			return "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300";
		case "pending":
			return "bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300";
		case "canceled":
			return "bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300";
	}
}

export function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
	);
}

export function formatInvoiceDateTime(dateStr, timeStr) {
	const date = new Date(dateStr);
	const time = new Date(timeStr);

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();

	const hours = time.getHours().toString().padStart(2, "0");
	const minutes = time.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDateFilename(date) {
	if (!date) return "";

	const dates = new Date(date);
	const day = String(dates.getDate()).padStart(2, "0");
	const month = String(dates.getMonth() + 1).padStart(2, "0");
	const year = dates.getFullYear();

	return `${day}/${month}/${year}`;
}

export function getPageTitle(subTitle) {
	return `Cheese Stick Koe - ${subTitle}`;
}
