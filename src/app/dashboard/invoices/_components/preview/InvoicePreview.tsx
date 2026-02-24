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
		ref,
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
				<div
					ref={ref}
					className={`invoice-content ${
						isDownloadVersion ? "w-[1080px]" : "w-full md:w-[1080px] md:p-8"
					}`}
					style={{
						fontFamily: "'Poppins', var(--font-poppins), sans-serif",
					}}
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
	},
);

InvoicePreview.displayName = "InvoicePreview";

export default InvoicePreview;

