import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle, Info, Loader, TriangleAlertIcon } from "lucide-react";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function getStatusVariant(status) {
	switch (status) {
		case "success":
			return "bg-emerald-50 text-emerald-700 border border-emerald-200";
		case "pending":
			return "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200";
		case "canceled":
			return "bg-rose-50 text-rose-700 border border-rose-200";
		default:
			return "bg-purple-50 text-purple-700 border border-purple-200";
	}
}

export function getStatusIcons(icon) {
	switch (icon) {
		case "success":
			return <CheckCircle className="w-3 h-3 inline-block mr-1 mt-0.5" />;
		case "pending":
			return <Loader className="w-3 h-3 inline-block mr-1 mt-0.5" />;
		case "canceled":
			return <TriangleAlertIcon className="w-3 h-3 inline-block mr-1 mt-0.5" />;
		default:
			return <Info className="w-3 h-3 inline-block mr-1" />;
	}
}

export function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
	);
}

export function formatDateTime(dateStr, timeStr = null) {
	if (!dateStr) return "-";

	let dateTimeStr = dateStr;

	if (timeStr) {
		// If it's already a full ISO string, just use it
		if (dateStr.includes("T")) {
			dateTimeStr = dateStr;
		} else {
			dateTimeStr = `${dateStr}T${timeStr}`;
		}
	}

	let timeVal = dateTimeStr;
	if (
		typeof dateTimeStr === "string" &&
		!dateTimeStr.endsWith("Z") &&
		!/[+-]\d{2}:?\d{2}/.test(dateTimeStr)
	) {
		// Check if it looks like an ISO string (has T or space)
		if (dateTimeStr.includes("T") || dateTimeStr.includes(" ")) {
			timeVal = dateTimeStr + "Z";
		}
	}

	const date = new Date(timeVal);

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();

	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatInvoiceDateTime(dateStr, timeStr) {
	return formatDateTime(dateStr, timeStr);
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

function getRawTotal(quantity, price) {
	return (quantity || 0) * (price || 0);
}

export function calculateDiscountPercent({
	quantity,
	price,
	discountMode,
	discountInput,
	discountAmount,
}) {
	const rawTotal = getRawTotal(quantity, price);

	if (!rawTotal) return "0";

	const amount =
		discountMode === "percent"
			? (parseFloat(discountInput) / 100) * rawTotal
			: parseInt(discountInput) || discountAmount || 0;

	const percent = (amount / rawTotal) * 100;

	return isNaN(percent) ? "0" : percent.toFixed(2);
}

export function calculateDiscountAmount({ quantity, price, discountInput, discountMode }) {
	const rawTotal = getRawTotal(quantity, price);
	if (discountMode === "percent") {
		return Math.round(((parseFloat(discountInput) || 0) / 100) * rawTotal);
	}
	return parseInt(discountInput) || 0;
}

/**
 * Format remaining time for user message
 * @param {number} resetTime - Timestamp when lockout expires
 * @returns {string}
 */
export function formatLockoutTime(resetTime) {
	const now = Date.now();
	const remainingMs = resetTime - now;
	const minutes = Math.ceil(remainingMs / 60000);

	if (minutes > 60) {
		const hours = Math.floor(minutes / 60);
		return `${hours} hour${hours > 1 ? "s" : ""}`;
	}

	return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

export function formatCurrency(value) {
	if (value === undefined || value === null || isNaN(value)) return "0";
	return Number(value).toLocaleString("id-ID");
}
