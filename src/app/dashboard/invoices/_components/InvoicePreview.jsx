"use client";

import { forwardRef, useEffect, useState } from "react";

import Image from "next/image";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

import { cn, formatDateFilename, toTitleCase } from "@/lib/utils";

const InvoicePreview = forwardRef(
	(
		{ invoice, invoiceItems, shippingType, onReady, onDataReady, isDownloadVersion = false },
		ref
	) => {
		const [products, setProducts] = useState([]);
		const [sizes, setSizes] = useState([]);
		const [items, setItems] = useState([]);

		useEffect(() => {
			const fetchData = async () => {
				const { data: productsData } = await getAllProducts();
				const { data: sizeData } = await getAllSizePrice();

				setProducts(productsData || []);
				setSizes(sizeData || []);
			};

			fetchData();
		}, []);

		useEffect(() => {
			if (invoiceItems?.length && products.length && sizes.length) {
				const mappedItems = invoiceItems.map((item) => {
					const product = products.find((p) => p.id === item.productId);
					const size = sizes.find((s) => s.id === item.sizePriceId);
					const price = size?.price || 0;
					const discount = item.discountAmount || 0;
					const quantity = item.quantity;

					return {
						productName: product?.name || "Unknown",
						sizeName: size?.size || "Unknown",
						quantity,
						price,
						discountAmount: discount,
						total: quantity * price - discount,
					};
				});

				setItems(mappedItems);

				onDataReady?.(true);
			} else {
				onDataReady?.(false);
			}
		}, [invoiceItems, products, sizes]);

		useEffect(() => {
			if (!items.length) return;

			const timer = setTimeout(() => {
				onReady?.();
			}, 0);

			return () => clearTimeout(timer);
		}, [items]);

		const subtotal = items.reduce((acc, item) => acc + item.total, 0);
		const discount = invoice.discount || 0;

		const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;

		const TOTAL_GAP_ROWS = 10;
		const gapRows = Math.max(0, TOTAL_GAP_ROWS - items.length);

		return (
			<>
				<style jsx global>{`
					@import url("https://fonts.googleapis.com/css2?family=Pattaya&family=Poppins:wght@400;700&display=swap");

					.invoice-content {
						font-family: "Poppins", sans-serif;
					}

					.thanks-msg {
						font-family: "Pattaya", cursive;
					}

					.invoice-content * {
						box-sizing: border-box;
					}

					.invoice-content table td,
					.invoice-content table th {
						padding: 8px 12px; /* ~px-3 py-2 */
						white-space: nowrap;
					}
				`}</style>

				<div
					ref={ref}
					className={cn(
						"border border-[#6D2315] font-sans text-sm text-gray-900 invoice-content",
						isDownloadVersion
							? "w-[1080px] p-3 overflow-visible"
							: "w-full md:w-[1080px] overflow-x-auto p-4"
					)}
				>
					<div
						className={cn("flex w-full", isDownloadVersion ? "flex-row" : "flex-col md:flex-row")}
					>
						{/* LEFT SECTION */}
						<div
							className={cn(
								"pr-4 border-r border-[#6D2315] space-y-6",
								isDownloadVersion ? "w-1/3" : "w-full md:w-1/3"
							)}
						>
							<div className="flex justify-center mb-4">
								<div className="w-24 h-24 relative">
									<Image src="/logo.png" alt="Logo" fill className="object-cover rounded-full" />
								</div>
							</div>

							<h2 className="text-center font-bold text-[#6b1d1d] uppercase text-lg pb-7">
								cheese stick koe
							</h2>

							<div>
								<h4 className="text-[#6b1d1d] font-semibold text-xs mb-1 uppercase">
									diberikan kepada
								</h4>
								<p className="text-sm">{toTitleCase(invoice?.buyerName)}</p>
							</div>

							<div>
								<h4 className="text-[#6b1d1d] font-semibold text-xs mb-1 uppercase">detail bank</h4>
								<div className="text-sm space-y-2">
									<div>
										<span className="font-semibold uppercase">bri</span>
										<br />
										Ermi Sayekti Endahwati
										<br />
										0122-01-012734-53-8
									</div>
									<div>
										<span className="font-semibold uppercase">bca</span>
										<br />
										Ermi Sayekti Endahwati
										<br />
										524-5031-928
									</div>
								</div>
							</div>

							<figure className="space-y-2">
								{/* Image */}
								<figcaption className="text-xs text-left font-bold italic">
									QRIS a.n Cheese Stick Koe
								</figcaption>

								<div className="flex justify-center mt-5">
									<div className="relative w-38 h-38">
										<Image src="/qris.png" alt="Icon" fill className="object-contain" />
									</div>
								</div>

								{/* Caption */}
							</figure>

							{/* Thank You Text */}
							<div className="text-center pt-5 font-bold text-2xl text-[#6b1d1d] thanks-msg uppercase">
								terima kasih
							</div>
						</div>

						{/* RIGHT SECTION */}
						<div className="md:w-2/3 w-full pl-6 space-y-6 mt-6 md:mt-0">
							<div className="text-center border-b border-[#6D2315] pb-2">
								<h1 className="font-bold text-lg uppercase">invoice pembayaran</h1>
								<div className="flex justify-between text-xs mt-1">
									<span>Invoice No. {invoice?.invoiceNumber}</span>
									<span className="whitespace-nowrap">
										{formatDateFilename(invoice?.invoiceDate)}
									</span>
								</div>
							</div>

							<div
								className={cn(
									!isDownloadVersion && "overflow-x-auto max-w-full",
									isDownloadVersion && "overflow-hidden"
								)}
							>
								<table
									className="text-left text-sm"
									style={{
										border: "1.5px solid #6D2315",
										tableLayout: "auto",
										width: "100%",
									}}
								>
									<thead
										style={{ backgroundColor: "white", borderBottom: "1.5px solid #6D2315" }}
										className="uppercase"
									>
										<tr>
											<th className="px-2.5 py-2 whitespace-nowrap">item</th>
											<th className="px-2.5 py-2 whitespace-nowrap">ukuran</th>
											<th className="px-2.5 py-2 whitespace-nowrap">jml</th>
											<th className="px-2.5 py-2 whitespace-nowrap">harga</th>
											<th className="px-2.5 py-2 whitespace-nowrap">diskon</th>
											<th className="px-2.5 py-2 whitespace-nowrap">total</th>
										</tr>
									</thead>
									<tbody>
										{items.map((item, i) => (
											<tr key={i}>
												<td className="px-2.5 py-2 whitespace-nowrap">{item.productName}</td>
												<td className="px-2.5 py-2 whitespace-nowrap text-center">
													{item.sizeName}
												</td>
												<td className="px-2.5 py-2 whitespace-nowrap text-center">
													{item.quantity}
												</td>
												<td className="px-2.5 py-2 whitespace-nowrap">{`Rp ${item.price.toLocaleString(
													"id-ID"
												)}`}</td>
												<td
													className={`px-2.5 py-2 whitespace-nowrap text-center ${
														item.discountAmount > 0 ? "text-green-600" : ""
													}`}
												>
													{item.discountAmount
														? `-Rp ${item.discountAmount.toLocaleString("id-ID")}`
														: "-"}
												</td>
												<td className="p-1 whitespace-nowrap">
													{item.total ? `Rp ${item.total.toLocaleString("id-ID")}` : "-"}
												</td>
											</tr>
										))}

										{Array.from({ length: gapRows }).map((_, idx) => (
											<tr key={`gap-${idx}`}>
												<td>&nbsp;</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
											</tr>
										))}

										{/* Subtotal */}
										<tr style={{ borderTop: "1.5px solid #6D2315" }}>
											<td colSpan="5" className="px-2.5 py-2 text-right uppercase">
												Sub Total :
											</td>
											<td className="px-2.5 py-2 whitespace-nowrap">
												Rp {subtotal.toLocaleString("id-ID")}
											</td>
										</tr>

										{/* Diskon */}
										{invoice?.discount > 0 && (
											<tr className="text-green-500">
												<td colSpan="5" className="px-2.5 py-2 text-right uppercase">
													diskon ({discountPercent.toFixed(2)}%) :
												</td>
												<td className="px-2.5 py-2 whitespace-nowrap">
													-Rp{" "}
													{typeof invoice.discount === "number"
														? invoice.discount.toLocaleString("id-ID")
														: "0"}
												</td>
											</tr>
										)}

										{/* Ongkir */}
										<tr>
											<td colSpan="5" className="px-2.5 py-2 text-right uppercase">
												{shippingType ? `ongkir (${shippingType}) :` : "ongkir :"}
											</td>
											<td className="px-2.5 py-2 whitespace-nowrap">
												Rp {invoice?.shipping?.toLocaleString("id-ID")}
											</td>
										</tr>

										{/* Total */}
										<tr style={{ borderBottom: "1.5px solid #6D2315" }}>
											<td
												colSpan="5"
												className="px-2.5 py-2 text-right font-bold text-red-700 uppercase"
											>
												jumlah yang harus dibayar :
											</td>
											<td className="px-2.5 py-2 font-bold text-red-700 whitespace-nowrap">
												Rp{" "}
												{typeof invoice.totalPrice === "number"
													? invoice.totalPrice.toLocaleString("id-ID")
													: "0"}
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							{/* Disclaimer */}
							<div className="text-red-600 pt-4 border-t border-gray-200">
								<span className="font-semibold text-sm">*Disclaimer</span>
								<br />
								<span className="text-black text-sm">
									Segala kerusakan yang terjadi selama pengiriman menjadi tanggung jawab pihak
									ekspedisi. Namun, kami siap membantu proses klaim ke pihak ekspedisi apabila
									terjadi kendala selama pengiriman.
								</span>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
);

export default InvoicePreview;
