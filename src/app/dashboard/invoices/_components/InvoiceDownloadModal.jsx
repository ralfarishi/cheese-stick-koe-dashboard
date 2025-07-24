"use client";

import { useRef, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import InvoicePreview from "./InvoicePreview";

import { exportInvoiceToPng } from "@/lib/exportToPng";
import { formatDateFilename } from "@/lib/utils";

import { toast } from "sonner";

export default function InvoiceDownloadModal({ open, onOpenChange, invoice, invoiceItems }) {
	const invoiceRef = useRef(null);
	const hiddenRef = useRef(null);

	const [isInvoiceReady, setIsInvoiceReady] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownload = async () => {
		if (isDownloading) {
			toast.error("Wait until download complete");
			return;
		}

		if (!isInvoiceReady) {
			toast.error("Wait a second. Invoice is loading ..");
			return;
		}

		setIsDownloading(true);

		try {
			await document.fonts.ready;
			await new Promise((r) => setTimeout(r, 200));

			const formattedName = `Invoice-${invoice.invoiceNumber}_${
				invoice.buyerName
			}_${formatDateFilename(invoice?.invoiceDate).replaceAll("/", "")}.png`
				.replace(/\s+/g, "-")
				.toLowerCase();

			await exportInvoiceToPng(hiddenRef.current, formattedName);
		} catch (error) {
			console.error("Download failed:", error);
			toast.error("Failed to export invoice");
		} finally {
			setTimeout(() => setIsDownloading(false), 3000);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogHeader>
				<DialogTitle className="sr-only">Preview Invoice</DialogTitle>
			</DialogHeader>
			<DialogContent
				className="max-w-full w-full max-h-[90vh] overflow-y-auto p-0 md:max-w-4xl"
				style={{ margin: "auto" }}
			>
				<div ref={hiddenRef} className="absolute -left-[9999px] top-0 bg-white p-2 w-[794px]">
					<InvoicePreview invoice={invoice} invoiceItems={invoiceItems} isDownloadVersion />
				</div>

				<div ref={invoiceRef} className="bg-white p-6">
					<InvoicePreview
						invoice={invoice}
						invoiceItems={invoiceItems}
						onReady={() => setIsInvoiceReady(true)}
					/>
				</div>

				{/* desktop view */}
				<div className="hidden md:block sticky bottom-0 z-10 bg-white p-4 border-t border-gray-200 shadow-sm text-center">
					<Button onClick={handleDownload} disabled={isDownloading}>
						{isDownloading ? "Please wait ..." : "Download PNG"}
					</Button>
				</div>

				{/* mobile view */}
				<div className="md:hidden sticky bottom-0 z-10 bg-white p-4 border-t border-gray-200">
					<Button className="w-full" onClick={handleDownload} disabled={isDownloading}>
						{isDownloading ? "Please wait ..." : "Download PNG"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
