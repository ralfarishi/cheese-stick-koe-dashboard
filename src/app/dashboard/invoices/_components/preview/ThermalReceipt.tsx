"use client";

import { useEffect } from "react";
import type { InvoiceWithItems } from "@/lib/types";
import { Store, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ThermalReceiptProps {
	invoice: InvoiceWithItems;
}

export default function ThermalReceipt({ invoice }: ThermalReceiptProps) {
	// Auto print on load
	useEffect(() => {
		const timer = setTimeout(() => {
			window.print();
		}, 800);
		return () => clearTimeout(timer);
	}, []);

	const handlePrint = () => {
		window.print();
	};

	const subtotal = invoice.items?.reduce((acc, item) => acc + item.subtotal, 0) || 0;
	const discountAmount = invoice.discount || 0;
	const shippingAmount = invoice.shipping || 0;
	const grandTotal = subtotal - discountAmount + shippingAmount;

	// Use safe access array items
	const items = invoice.items || [];

	return (
		<div className="flex flex-col items-center font-mono">
			{/* Action Bar */}
			<div className="w-full max-w-[80mm] flex justify-between items-center mb-6 print:hidden">
				<Link href="/dashboard/invoices">
					<Button variant="outline" size="sm" className="gap-2 shadow-sm border-gray-200">
						<ArrowLeft className="w-4 h-4" />
						Back
					</Button>
				</Link>
				<Button
					size="sm"
					onClick={handlePrint}
					className="gap-2 shadow-sm bg-[#8B2E1F] hover:bg-[#6D2315] hover:text-white border border-[#8B2E1F]"
				>
					<Printer className="w-4 h-4" />
					Print Receipt
				</Button>
			</div>

			{/* Printable Box */}
			<div
				id="thermal-receipt"
				className="w-[80mm] min-h-[100mm] bg-white text-black p-4 text-sm shadow-xl print:shadow-none print:p-0"
			>
				{/* Header */}
				<div className="flex flex-col items-center text-center mb-5 border-b-2 border-dashed border-gray-400 pb-4">
					<div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-2 print:border-black print:border-2">
						<Store className="w-6 h-6" />
					</div>
					<h1 className="text-xl font-bold mt-1 tracking-tight uppercase">Cheese Stick Koe</h1>
					<p className="text-[11px] text-gray-600 mt-1 uppercase tracking-wide">
						Premium Cheese Sticks & Snacks
					</p>
				</div>

				{/* Invoice Meta */}
				<div className="mb-4 space-y-1.5 text-xs">
					<div className="flex justify-between">
						<span className="text-gray-500 font-medium">Inv. No:</span>
						<span className="font-semibold">{invoice.invoiceNumber}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-500 font-medium">Date:</span>
						<span>
							{new Date(invoice.invoiceDate)
								.toLocaleDateString("id-ID", {
									day: "2-digit",
									month: "short",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
								.replace(",", "")}
						</span>
					</div>
					<div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
						<span className="text-gray-500 font-medium">Cust:</span>
						<span className="font-semibold uppercase truncate max-w-[120px]">
							{invoice.buyerName}
						</span>
					</div>
				</div>

				<div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

				{/* Items */}
				<div className="mb-4">
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-gray-200 text-gray-600">
								<th className="text-left py-1 font-semibold w-full">Item</th>
								<th className="text-right py-1 font-semibold px-2">Qty</th>
								<th className="text-right py-1 font-semibold">Total</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{items.map((item, index) => (
								<tr key={index}>
									<td className="py-2 pr-2">
										<div className="font-semibold truncate max-w-[140px] uppercase">
											{item.product?.name || "Product"}
										</div>
										<div className="text-[10px] text-gray-500 mt-0.5">
											{item.sizePrice?.size} x{" "}
											{(item.sizePrice?.price || 0).toLocaleString("id-ID")}
										</div>
										{!!item.discountAmount && item.discountAmount > 0 && (
											<div className="text-[10px] text-gray-500 mt-0.5">
												Disc: -{item.discountAmount.toLocaleString("id-ID")}
											</div>
										)}
									</td>
									<td className="py-2 px-2 text-right align-top font-medium">{item.quantity}</td>
									<td className="py-2 text-right align-top font-semibold truncate">
										{(item.totalCost || item.subtotal).toLocaleString("id-ID")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

				{/* Totals */}
				<div className="space-y-1.5 text-xs mb-6">
					<div className="flex justify-between text-gray-600">
						<span>Subtotal</span>
						<span className="font-medium text-black">{subtotal.toLocaleString("id-ID")}</span>
					</div>

					{discountAmount > 0 && (
						<div className="flex justify-between text-gray-600">
							<span>Discount</span>
							<span className="font-medium text-black">
								-{discountAmount.toLocaleString("id-ID")}
							</span>
						</div>
					)}

					{shippingAmount > 0 && (
						<div className="flex justify-between text-gray-600">
							<span>Shipping</span>
							<span className="font-medium text-black">
								{shippingAmount.toLocaleString("id-ID")}
							</span>
						</div>
					)}

					<div className="flex justify-between text-sm pt-2 border-t border-black mt-2">
						<span className="font-bold">TOTAL</span>
						<span className="font-bold text-[15px]">Rp {grandTotal.toLocaleString("id-ID")}</span>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center text-xs text-gray-500 space-y-1.5 mt-8 mb-4">
					<p className="font-medium text-black">Terima Kasih Atas Pembelian Anda</p>
					<p className="text-[10px] leading-tight px-4">
						Barang yang sudah dibeli tidak dapat ditukar/dikembalikan
					</p>
				</div>
			</div>

			<style jsx global>{`
				@media print {
					@page {
						margin: 0;
						size: 80mm auto; /* Standard 80mm thermal paper width */
					}
					html,
					body {
						margin: 0;
						padding: 0;
						background: #ffffff;
						width: 80mm;
					}
					body * {
						visibility: hidden;
					}
					#thermal-receipt,
					#thermal-receipt * {
						visibility: visible;
						color: black !important;
						font-size: 100%;
					}
					#thermal-receipt {
						position: absolute;
						left: 0;
						top: 0;
						width: 100% !important;
						max-width: 80mm !important;
						margin: 0 !important;
						padding: 4mm !important;
						box-shadow: none !important;
						background: white !important;
						border: none !important;
					}
				}
			`}</style>
		</div>
	);
}
