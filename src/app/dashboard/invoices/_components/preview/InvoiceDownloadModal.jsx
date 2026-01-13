"use client";

import { useRef, useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import InvoicePreview from "./InvoicePreview";

import { exportInvoiceToPng } from "@/lib/exportToPng";
import { formatDateFilename } from "@/lib/utils";

import { toast } from "sonner";
import { Truck, Zap, Clock, Package, Box, X } from "lucide-react";

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
			<DialogContent
				className="w-full md:max-w-6xl max-h-[90vh] overflow-y-auto p-0 mx-auto"
				showCloseButton={false}
			>
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
						onReady={() => setIsInvoiceReady(true)}
						shippingType={shippingType}
						isDownloadVersion
					/>
				</div>

				{/* Sticky Header for Shipping Options */}
				<div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
					<div className="flex items-center justify-between gap-3 md:gap-4">
						{/* Left: Icon & Label */}
						<div className="flex items-center gap-2 pr-3 md:pr-4 border-r border-gray-200 shrink-0">
							<div className="p-1.5 md:p-2 bg-orange-100 rounded-lg">
								<Truck className="w-4 h-4 text-orange-700" />
							</div>
							<span className="hidden md:inline text-sm font-semibold text-gray-900 whitespace-nowrap">
								Opsi Pengiriman
							</span>
						</div>

						{/* Middle: Scrollable Options */}
						<div className="flex-1 overflow-x-auto no-scrollbar">
							<RadioGroup
								value={shippingType}
								onValueChange={setShippingType}
								className="flex items-center gap-2 md:gap-3 min-w-max"
							>
								{[
									{
										value: "",
										label: "Default",
										icon: <Box className="w-3.5 h-3.5 md:w-4 md:h-4" />,
									},
									{
										value: "sameday",
										label: "Same Day",
										icon: <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />,
									},
									{
										value: "instan",
										label: "Instant",
										icon: <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />,
									},
									{
										value: "jne",
										label: "JNE",
										icon: <Package className="w-3.5 h-3.5 md:w-4 md:h-4" />,
									},
									{
										value: "j&t",
										label: "J&T",
										icon: <Truck className="w-3.5 h-3.5 md:w-4 md:h-4" />,
									},
								].map((option) => (
									<Label
										key={option.value}
										htmlFor={option.value || "default"}
										className={`
											relative flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg border cursor-pointer transition-all duration-200 group shrink-0
											${
												shippingType === option.value
													? "border-[#8B2E1F] bg-orange-50 text-[#8B2E1F] shadow-sm ring-1 ring-[#8B2E1F]/20"
													: "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-gray-50"
											}
										`}
									>
										<RadioGroupItem
											value={option.value}
											id={option.value || "default"}
											className="sr-only"
										/>

										<div
											className={`
												transition-colors duration-200
												${shippingType === option.value ? "text-[#8B2E1F]" : "text-gray-400 group-hover:text-orange-600"}
											`}
										>
											{option.icon}
										</div>

										<span className="text-xs md:text-sm font-medium whitespace-nowrap">
											{option.label}
										</span>
									</Label>
								))}
							</RadioGroup>
						</div>

						{/* Right: Close Button */}
						<div className="pl-2 border-l border-gray-200 shrink-0">
							<DialogClose asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900"
								>
									<X className="w-4 h-4" />
									<span className="sr-only">Close</span>
								</Button>
							</DialogClose>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div ref={invoiceRef} className="bg-white p-6">
					<InvoicePreview
						invoice={invoice}
						invoiceItems={invoiceItems}
						onDataReady={setDataReady}
						shippingType={shippingType}
						onReady={() => setIsInvoiceReady(true)}
					/>
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

