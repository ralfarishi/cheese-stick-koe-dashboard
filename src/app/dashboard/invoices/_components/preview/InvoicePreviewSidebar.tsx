"use client";

import type { Invoice } from "@/lib/types";
import Image from "next/image";
import { toTitleCase } from "@/lib/utils";
import { CircleUserRound, Landmark } from "lucide-react";

interface InvoicePreviewSidebarProps {
	invoice: Invoice;
}

interface BankCardProps {
	bankName: string;
	accountName: string;
	accountNumber: string;
	bgColor: string;
}

export default function InvoicePreviewSidebar({ invoice }: InvoicePreviewSidebarProps) {
	return (
		<div className="space-y-6">
			{/* Customer Info Card */}
			<div
				className="rounded-2xl p-5 border-2"
				style={{
					backgroundColor: "#fef3e8",
					borderColor: "rgba(212, 105, 60, 0.2)",
				}}
			>
				<div className="flex items-center gap-2 mb-0.5">
					<div
						className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
						style={{ backgroundColor: "#8B2E1F" }}
					>
						<CircleUserRound width={22} height={22} />
					</div>
					<h3 className="font-semibold text-[#6b1d1d] uppercase text-sm">Diberikan Kepada</h3>
				</div>
				<p className="text-lg font-semibold text-[#44403c] ml-10">
					{toTitleCase(invoice.buyerName)}
				</p>
			</div>

			{/* Bank Details Card */}
			<div
				className="rounded-2xl p-5 border-2"
				style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
			>
				<div className="flex items-center gap-2 mb-4">
					<div
						className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
						style={{ backgroundColor: "#8B2E1F" }}
					>
						<Landmark width={20} height={20} />
					</div>
					<h3 className="font-semibold text-[#6b1d1d] uppercase text-sm">Detail Bank</h3>
				</div>
				<div className="space-y-4">
					<BankCard
						bankName="BRI"
						accountName="Ermi Sayekti Endahwati"
						accountNumber="0122-01-012734-53-8"
						bgColor="#fef3e8"
					/>
					<BankCard
						bankName="BCA"
						accountName="Ermi Sayekti Endahwati"
						accountNumber="524-5031-928"
						bgColor="#fff5ed"
					/>
				</div>
			</div>

			{/* QRIS Card */}
			<div
				className="rounded-2xl p-5 border-2"
				style={{
					background: "#fef3e8",
					borderColor: "rgba(212, 105, 60, 0.2)",
				}}
			>
				<p className="text-sm font-bold text-center text-[#6b1d1d] mb-3 uppercase">
					QRIS a.n Cheese Stick Koe
				</p>
				<div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-lg flex items-center justify-center">
					<Image src="/qris.png" width={165} height={165} alt="QRIS" />
				</div>
			</div>

			{/* Thank You Message */}
			<div className="text-center py-5">
				<div className="inline-block">
					<div className="thanks-msg text-3xl font-bold text-amber-800 uppercase tracking-wide">
						Terima Kasih
					</div>
					<div className="flex justify-center mt-2 gap-1">
						<span className="decorative-dot"></span>
						<span className="decorative-dot"></span>
						<span className="decorative-dot"></span>
					</div>
				</div>
			</div>
		</div>
	);
}

function BankCard({ bankName, accountName, accountNumber, bgColor }: BankCardProps) {
	return (
		<div
			className="rounded-xl p-4 border-l-4"
			style={{
				background: bgColor,
				borderColor: "#d4693c",
			}}
		>
			<p className="font-bold text-xs text-[#6b1d1d] mb-1">{bankName}</p>
			<p className="text-sm text-gray-700 leading-relaxed">
				{accountName}
				<br />
				<span className="font-mono font-extrabold">{accountNumber}</span>
			</p>
		</div>
	);
}
