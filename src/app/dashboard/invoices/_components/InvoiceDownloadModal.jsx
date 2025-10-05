"use client";

import { useRef, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import InvoicePreview from "./InvoicePreview";

import { exportInvoiceToPng } from "@/lib/exportToPng";
import { formatDateFilename } from "@/lib/utils";

import { toast } from "sonner";

export default function InvoiceDownloadModal({ open, onOpenChange, invoice, invoiceItems }) {
	const invoiceRef = useRef(null);
	const hiddenRef = useRef(null);

	const [dataReady, setDataReady] = useState(false);
	const [isInvoiceReady, setIsInvoiceReady] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [shippingType, setShippingType] = useState("");

	const handleDownload = async () => {
		if (isLoading) {
			toast.error("Wait until download complete");
			return;
		}

		if (!isInvoiceReady || !dataReady) {
			toast.error("Wait a second. Invoice is loading ..");
			return;
		}

		setIsLoading(true);

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
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogHeader>
				<DialogTitle className="sr-only">Preview Invoice</DialogTitle>
			</DialogHeader>
			<DialogContent className="w-full md:max-w-7xl max-h-[90vh] overflow-y-auto p-0 mx-auto">
				<div
					ref={hiddenRef}
					className="absolute -left-[9999px] top-0 bg-white p-2"
					style={{
						width: "max-content",
						display: "inline-block",
						overflow: "visible",
					}}
				>
					<InvoicePreview
						invoice={invoice}
						invoiceItems={invoiceItems}
						onDataReady={setDataReady}
						oonReady={() => setIsInvoiceReady(true)}
						shippingType={shippingType}
						isDownloadVersion
					/>
				</div>

				<div className="flex flex-col md:flex-row gap-0">
					{/* main content */}
					<div ref={invoiceRef} className="bg-white p-6 flex-1">
						<InvoicePreview
							invoice={invoice}
							invoiceItems={invoiceItems}
							onDataReady={setDataReady}
							shippingType={shippingType}
							onReady={() => setIsInvoiceReady(true)}
						/>
					</div>

					{/* sidebar */}
					<div className="md:w-64 bg-white pt-5 flex flex-col items-center md:items-start text-center md:text-left">
						<p className="mb-2 font-medium">Pilih Ongkir</p>
						<RadioGroup
							value={shippingType}
							onValueChange={setShippingType}
							className="flex flex-col gap-3"
						>
							{["", "sameday", "instan", "jne", "j&t"].map((value) => (
								<div key={value} className="flex items-center space-x-2">
									<RadioGroupItem value={value} id={value || "default"} />
									<Label htmlFor={value || "default"} className="text-xs">
										{value === "" ? "Default (tanpa opsi)" : value}
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>
				</div>

				{/* desktop view */}
				<div className="hidden md:block sticky bottom-0 z-10 bg-white p-4 border-t border-gray-200 shadow-sm text-center">
					<Button onClick={handleDownload} disabled={isLoading}>
						{isLoading ? "Please wait ..." : "Download PNG"}
					</Button>
				</div>

				{/* mobile view */}
				<div className="md:hidden sticky bottom-0 z-10 bg-white p-4 border-t border-gray-200">
					<Button className="w-full" onClick={handleDownload} disabled={isLoading}>
						{isLoading ? "Please wait ..." : "Download PNG"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
