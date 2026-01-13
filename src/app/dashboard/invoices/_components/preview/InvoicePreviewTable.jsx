"use client";

/**
 * InvoicePreviewTable - Items table with summary
 * Extracted from InvoicePreview.jsx for better code organization
 */
export default function InvoicePreviewTable({
	items,
	invoice,
	subtotal,
	discountPercent,
	shippingType,
	gapRows,
}) {
	const hasDiscount = invoice.discount > 0;

	return (
		<div className="md:col-span-2 space-y-6">
			{/* Items Table */}
			<div
				className="rounded-2xl overflow-hidden border-2 relative"
				style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
			>
				{/* Watermark */}
				<Watermark />

				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<TableHeader hasDiscount={hasDiscount} />
						<tbody className="divide-y divide-gray-100">
							{items.map((item, i) => (
								<TableRow key={i} item={item} index={i} hasDiscount={hasDiscount} />
							))}

							{Array.from({ length: gapRows }).map((_, idx) => (
								<tr key={`gap-${idx}`} className="h-10">
									<td colSpan={hasDiscount ? 6 : 5}></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Summary Section */}
				<SummaryFooter
					subtotal={subtotal}
					invoice={invoice}
					discountPercent={discountPercent}
					shippingType={shippingType}
				/>
			</div>

			{/* Disclaimer */}
			<Disclaimer />
		</div>
	);
}

function Watermark() {
	return (
		<div
			className="absolute flex items-center justify-center pointer-events-none z-10"
			style={{
				top: "-12%",
				left: 0,
				right: 0,
				bottom: "12%",
				overflow: "hidden",
				transform: "rotate(-38deg)",
			}}
		>
			<div
				className="text-5xl font-bold uppercase tracking-wider"
				style={{
					color: "rgba(139, 46, 31, 0.02)",
					textShadow: "0 0 20px rgba(255,255,255,0.5)",
				}}
			>
				Cheese Stick Koe
			</div>
		</div>
	);
}

function TableHeader({ hasDiscount }) {
	return (
		<thead className="text-white" style={{ backgroundColor: "#8B2E1F" }}>
			<tr>
				<th className="px-4 py-3 text-left text-sm font-semibold uppercase whitespace-nowrap">
					Item
				</th>
				<th className="px-4 py-3 text-center text-sm font-semibold uppercase whitespace-nowrap">
					Ukuran
				</th>
				<th className="px-4 py-3 text-center text-sm font-semibold uppercase whitespace-nowrap">
					Jml
				</th>
				<th className="px-4 py-3 text-center text-sm font-semibold uppercase whitespace-nowrap">
					Harga
				</th>
				{hasDiscount && (
					<th className="px-4 py-3 text-center text-sm font-semibold uppercase whitespace-nowrap">
						Diskon
					</th>
				)}
				<th className="px-4 py-3 text-center text-sm font-semibold uppercase whitespace-nowrap">
					Total
				</th>
			</tr>
		</thead>
	);
}

function TableRow({ item, index, hasDiscount }) {
	return (
		<tr
			className="hover:bg-orange-50/50 transition-colors"
			style={{
				backgroundColor: index % 2 === 0 ? "#ffffff" : "#fffbf5",
			}}
		>
			<td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{item.productName}</td>
			<td className="px-4 py-3 text-center whitespace-nowrap">
				<span
					className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
					style={{
						backgroundColor: "#fed7aa",
						color: "#9a3412",
					}}
				>
					{item.sizeName}
				</span>
			</td>
			<td className="px-4 py-3 text-center">
				<span
					className="inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold"
					style={{ backgroundColor: "#f3f4f6" }}
				>
					{item.quantity}
				</span>
			</td>
			<td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">
				Rp {item.price.toLocaleString("id-ID")}
			</td>
			{hasDiscount && (
				<td
					className={`px-4 py-3 text-center font-semibold whitespace-nowrap ${
						item.discountAmount > 0 ? "text-green-600" : "text-gray-400"
					}`}
				>
					{item.discountAmount ? `-Rp ${item.discountAmount.toLocaleString("id-ID")}` : "-"}
				</td>
			)}
			<td className="px-4 py-3 text-center font-semibold text-gray-800 whitespace-nowrap">
				Rp {item.total.toLocaleString("id-ID")}
			</td>
		</tr>
	);
}

function SummaryFooter({ subtotal, invoice, discountPercent, shippingType }) {
	return (
		<div
			className="border-t-2"
			style={{
				background: "linear-gradient(to bottom right, #f9fafb, #fff7ed)",
				borderColor: "#e5e7eb",
			}}
		>
			<div className="p-5 space-y-2">
				<div className="flex justify-between items-center py-2">
					<span className="text-sm font-medium text-gray-600 uppercase">Sub Total</span>
					<span className="text-base font-semibold text-gray-800">
						Rp {subtotal.toLocaleString("id-ID")}
					</span>
				</div>

				{invoice.discount > 0 && (
					<div className="flex justify-between items-center py-2 text-green-600">
						<span className="text-sm font-medium uppercase">
							Diskon ({discountPercent.toFixed(2)}%)
						</span>
						<span className="text-base font-semibold">
							-Rp {invoice?.discount.toLocaleString("id-ID")}
						</span>
					</div>
				)}

				<div className="flex justify-between items-center py-2">
					<span className="text-sm font-medium text-gray-600 uppercase">
						{shippingType ? `Ongkir (${shippingType})` : "Ongkir"}
					</span>
					<span className="text-base font-semibold text-gray-800">
						{invoice.shipping ? `Rp ${invoice.shipping?.toLocaleString("id-ID")}` : "-"}
					</span>
				</div>

				<div
					className="wave-divider my-3"
					style={{
						height: "2px",
						background: "linear-gradient(to right, transparent, #D4693C, transparent)",
						position: "relative",
					}}
				></div>

				<div
					className="flex justify-between items-center py-3 rounded-xl px-4"
					style={{
						background: "linear-gradient(to right, #8B2E1F, #A63825)",
					}}
				>
					<span className="text-sm font-bold text-white uppercase">Jumlah Yang Harus Dibayar</span>
					<span className="text-xl font-bold text-white">
						Rp {invoice?.totalPrice.toLocaleString("id-ID")}
					</span>
				</div>
			</div>
		</div>
	);
}

function Disclaimer() {
	return (
		<div
			className="border-l-4 rounded-xl p-5"
			style={{ backgroundColor: "#fef2f2", borderColor: "#ef4444" }}
		>
			<div className="flex gap-3">
				<div className="flex-shrink-0 text-2xl">⚠️</div>
				<div>
					<p className="font-bold text-sm mb-2" style={{ color: "#b91c1c" }}>
						Disclaimer
					</p>
					<p className="text-xs text-gray-700 leading-relaxed">
						Segala kerusakan yang terjadi selama pengiriman menjadi tanggung jawab pihak ekspedisi.
						Namun, kami siap membantu proses klaim ke pihak ekspedisi apabila terjadi kendala selama
						pengiriman.
					</p>
				</div>
			</div>
		</div>
	);
}
