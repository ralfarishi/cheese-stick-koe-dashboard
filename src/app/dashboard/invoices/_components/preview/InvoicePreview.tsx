"use client";

import { forwardRef } from "react";
import type { Invoice, InvoiceItem } from "@/lib/types";
import { useInvoicePreviewData } from "../../_hooks/useInvoicePreviewData";
import InvoicePreviewSkeleton from "./InvoicePreviewSkeleton";
import InvoicePreviewHeader from "./InvoicePreviewHeader";
import InvoicePreviewSidebar from "./InvoicePreviewSidebar";
import InvoicePreviewTable from "./InvoicePreviewTable";

interface InvoicePreviewProps {
	invoice: Invoice;
	invoiceItems: InvoiceItem[];
	shippingType?: string;
	onReady?: () => void;
	onDataReady?: (ready: boolean) => void;
	isDownloadVersion?: boolean;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
	(
		{ invoice, invoiceItems, shippingType, onReady, onDataReady, isDownloadVersion = false },
		ref
	) => {
		const { isLoading, items, subtotal, discountPercent, gapRows } = useInvoicePreviewData({
			invoiceItems,
			invoice,
			onDataReady,
			onReady,
		});

		if (isLoading) {
			return <InvoicePreviewSkeleton isDownloadVersion={isDownloadVersion} />;
		}

		return (
			<>
				<InvoicePreviewStyles />

				<div
					ref={ref}
					className={`invoice-content ${
						isDownloadVersion ? "w-[1080px]" : "w-full md:w-[1080px] md:p-8"
					}`}
					style={{ backgroundColor: "#ffffff" }}
				>
					<div
						className="gradient-border card-shadow rounded-[20px] overflow-hidden"
						style={{ backgroundColor: "#ffffff" }}
					>
						<InvoicePreviewHeader invoice={invoice} />

						<div
							className={`grid ${
								isDownloadVersion ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3"
							} gap-6 p-8`}
							style={{ backgroundColor: "#ffffff" }}
						>
							<InvoicePreviewSidebar invoice={invoice} />

							<InvoicePreviewTable
								items={items}
								invoice={invoice}
								subtotal={subtotal}
								discountPercent={discountPercent}
								shippingType={shippingType}
								gapRows={gapRows}
							/>
						</div>
					</div>
				</div>
			</>
		);
	}
);

InvoicePreview.displayName = "InvoicePreview";

function InvoicePreviewStyles() {
	return (
		<style jsx global>{`
			@import url("https://fonts.googleapis.com/css2?family=Pattaya&family=Poppins:wght@300;400;500;600;700&display=swap");

			.invoice-content {
				font-family: "Poppins", sans-serif;
				background: #ffffff;
			}

			.thanks-msg {
				font-family: "Pattaya", cursive;
			}

			.gradient-border {
				position: relative;
				background: white;
				border: 3px solid #8b2e1f;
			}

			.card-shadow {
				box-shadow: 0 10px 40px rgba(107, 29, 29, 0.15);
			}

			.decorative-dot {
				width: 8px;
				height: 8px;
				background: #d4693c;
				border-radius: 50%;
				display: inline-block;
				margin: 0 8px;
			}

			.wave-divider {
				height: 2px;
				background: linear-gradient(90deg, transparent, #d4693c, transparent);
				position: relative;
			}
		`}</style>
	);
}

export default InvoicePreview;

