"use client";

import Image from "next/image";
import { formatDateFilename } from "@/lib/utils";

export default function InvoicePreviewHeader({ invoice }) {
	return (
		<div className="p-8 text-white relative overflow-hidden" style={{ backgroundColor: "#8B2E1F" }}>
			<div
				className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32"
				style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
			></div>
			<div
				className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-24 -mb-24"
				style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
			></div>

			<div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
				<div className="flex items-center gap-4">
					<div className="w-22 h-22 rounded-full p-0.5" style={{ backgroundColor: "#ffffff" }}>
						<div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold">
							<Image src="/logo.png" alt="Logo" width={85} height={85} />
						</div>
					</div>
					<div>
						<h1 className="text-2xl md:text-3xl font-bold tracking-wide">CHEESE STICK KOE</h1>
						<p className="text-lg mt-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
							Invoice Pembayaran
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
						<p className="text-lg text-white/80 font-bold">Invoice #{invoice.invoiceNumber}</p>
					</div>
					<p className="text-sm text-white/80 mt-2">{formatDateFilename(invoice.invoiceDate)}</p>
				</div>
			</div>
		</div>
	);
}
