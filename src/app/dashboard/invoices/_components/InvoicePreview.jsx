"use client";

import { forwardRef, useEffect, useState } from "react";

import Image from "next/image";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

import { cn, formatDateFilename, toTitleCase } from "@/lib/utils";

const InvoicePreview = forwardRef(
	({ invoice, invoiceItems, onReady, isDownloadVersion = false }, ref) => {
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

					return {
						productName: product?.name || "Unknown",
						sizeName: size?.size || "Unknown",
						quantity: item.quantity,
						price: size?.price || 0,
						total: item.quantity * (size?.price || 0),
					};
				});

				setItems(mappedItems);

				onReady?.();
			}
		}, [invoiceItems, products, sizes]);

		const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

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
				`}</style>

				<div
					ref={ref}
					className={cn(
						"mx-auto border border-[#6D2315] p-4 font-sans text-sm text-gray-900 overflow-x-auto invoice-content",
						isDownloadVersion ? "w-[794px]" : "w-full md:w-[794px]"
					)}
				>
					<div className={cn("flex", isDownloadVersion ? "flex-row" : "flex-col md:flex-row")}>
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

							<h2 className="text-center font-bold text-[#6b1d1d] uppercase text-lg">
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

								<div className="flex justify-center">
									<div className="relative w-38 h-38">
										<Image src="/qris.png" alt="Icon" fill className="object-contain" />
									</div>
								</div>

								{/* Caption */}
							</figure>

							{/* Thank You Text */}
							<div className="text-center pt-4 font-bold text-xl text-[#6b1d1d] thanks-msg uppercase">
								terima kasih
							</div>
						</div>

						{/* RIGHT SECTION */}
						<div className="md:w-2/3 w-full pl-4 space-y-6 mt-6 md:mt-0">
							<div className="text-center border-b border-[#6D2315] pb-2">
								<h1 className="font-bold text-lg uppercase">invoice pembayaran</h1>
								<div className="flex justify-between text-xs mt-1">
									<span>Invoice No. {invoice?.invoiceNumber}</span>
									<span>{formatDateFilename(invoice?.invoiceDate)}</span>
								</div>
							</div>

							<div className="overflow-x-auto">
								<table
									className="w-full text-left text-sm"
									style={{ border: "1.5px solid #6D2315" }}
								>
									<thead
										style={{ backgroundColor: "white", borderBottom: "1.5px solid #6D2315" }}
										className="uppercase"
									>
										<tr>
											<th className="p-2">item</th>
											<th className="p-2">ukuran</th>
											<th className="p-2">jml</th>
											<th className="p-2">harga</th>
											<th className="p-2">total</th>
										</tr>
									</thead>
									<tbody>
										{items.map((item, i) => (
											<tr key={i}>
												<td className="p-2">{item.productName}</td>
												<td className="p-2 text-center">{item.sizeName}</td>
												<td className="p-2 text-center">{item.quantity}</td>
												<td className="p-1">{`Rp ${item.total.toLocaleString("id-ID")}`}</td>
												<td className="p-2">{`Rp ${item.price.toLocaleString("id-ID")}`}</td>
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
												<td></td>
											</tr>
										))}

										{/* Subtotal */}
										<tr style={{ borderTop: "1.5px solid #6D2315" }}>
											<td colSpan="4" className="p-2 text-right uppercase">
												Sub Total :
											</td>
											<td className="p-2">Rp {subtotal.toLocaleString("id-ID")}</td>
										</tr>

										{/* Ongkir */}
										<tr>
											<td colSpan="4" className="p-2 text-right uppercase">
												ongkir :
											</td>
											<td className="p-2">Rp {invoice?.shipping?.toLocaleString("id-ID")}</td>
										</tr>

										{/* Total */}
										<tr style={{ borderBottom: "1.5px solid #6D2315" }}>
											<td colSpan="4" className="p-2 text-right font-bold text-red-700 uppercase">
												jumlah yang harus dibayar :
											</td>
											<td className="p-2 font-bold text-red-700">
												Rp {invoice?.totalPrice?.toLocaleString("id-ID")}
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
