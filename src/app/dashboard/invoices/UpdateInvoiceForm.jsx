"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import DatePicker from "@/components/dashboard/DatePicker";

import ProductCombobox from "./create/_components/ProductsCombobox";
import SizeCombobox from "./create/_components/SizeCombobox";
import StatusCombobox from "./_components/StatusCombobox";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";
import { updateInvoice } from "@/lib/actions/invoice/updateInvoice";

import { calculateDiscountAmount, calculateDiscountPercent, getPageTitle } from "@/lib/utils";
import { ChevronRight, Trash2 } from "lucide-react";

import { toast } from "sonner";

export const metadata = {
	title: getPageTitle("Invoice Edit"),
};

export default function UpdateInvoiceForm({ invoice }) {
	const router = useRouter();

	const [products, setProducts] = useState([]);
	const [sizes, setSizes] = useState([]);

	const [invoiceDate, setInvoiceDate] = useState(invoice.invoiceDate?.split("T")[0] || "");
	const [items, setItems] = useState([]);
	const [shippingPrice, setShippingPrice] = useState(invoice.shipping || 0);
	const [status, setStatus] = useState(invoice.status || "pending");

	const [discountMode, setDiscountMode] = useState("amount");
	const [discountInput, setDiscountInput] = useState(0);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			invoiceNumber: invoice.invoiceNumber || "",
			buyerName: invoice.buyerName || "",
		},
		mode: "onChange",
	});

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
		if (invoice?.items?.length) {
			const mappedItems = invoice.items.map((item) => {
				const quantity = item.quantity || 0;
				const price = item.sizePrice?.price || 0;
				const subtotal = quantity * price;

				const discountAmount = item.discountAmount || 0;

				return {
					productId: item.productId,
					sizePriceId: item.sizePriceId,
					quantity,
					price,
					discountAmount,
					discountInput: String(discountAmount),
					discountMode: "amount",
					total: subtotal - discountAmount,
				};
			});

			setItems(mappedItems);
		}

		if (invoice?.discount !== undefined) {
			setDiscountInput(String(invoice.discount));
			setDiscountMode("amount");
		}
	}, [invoice]);

	const onUpdate = async (data) => {
		const isInvalid = items.some((item) => !item.productId || !item.sizePriceId);

		if (isInvalid) {
			toast.error("You must add product and size before submitting!");
			return;
		}

		const result = await updateInvoice({
			invoiceId: invoice.id,
			invoiceData: {
				invoiceNumber: data.invoiceNumber,
				buyerName: data.buyerName.trim().toLowerCase(),
				invoiceDate,
				totalPrice,
				discount: discountAmount,
				shipping: parseInt(shippingPrice),
				status,
			},
			items,
		});

		if (!result.success) {
			toast.error(result.error || "Failed to update invoice");
			return;
		}

		toast.success("Invoice has been updated!");
		router.push("/dashboard/invoices");
	};

	const handleItemChange = (index, field, value, mode = null) => {
		const updatedItems = [...items];
		const item = updatedItems[index];

		if (field === "sizePriceId") {
			const selectedSize = sizes.find((s) => s.id === value);
			item.sizePriceId = value;
			item.price = selectedSize?.price || 0;
		} else if (field === "quantity") {
			const parsed = parseInt(value, 10);
			item.quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
		} else if (field === "price") {
			const parsed = parseInt(value, 10);
			item.price = isNaN(parsed) ? 0 : parsed;
		} else if (field === "discountMode") {
			item.discountMode = value;
		} else if (field === "discountInput") {
			item.discountInput = value;
			item.discountMode = mode;
		} else {
			item[field] = value;
		}

		const qty = item.quantity || 0;
		const price = item.price || 0;

		const rawTotal = qty * price;

		const discountAmount = calculateDiscountAmount({
			quantity: item.quantity,
			price: item.price,
			discountInput: item.discountInput,
			discountMode: item.discountMode,
		});

		item.discountAmount = discountAmount;
		item.total = rawTotal - discountAmount;

		setItems(updatedItems);
	};

	const subtotal = items.reduce((sum, item) => sum + item.total, 0);

	const discountAmount =
		discountMode === "percent"
			? Math.round(((parseFloat(discountInput) || 0) / 100) * subtotal)
			: parseInt(discountInput) || 0;

	const discountPercent =
		discountMode === "amount"
			? ((parseInt(discountInput) || 0) / subtotal) * 100
			: parseFloat(discountInput) || 0;

	const totalPrice = subtotal + (parseInt(shippingPrice) || 0) - discountAmount;

	const addItem = () => {
		setItems([
			...items,
			{
				productId: "",
				sizePriceId: "",
				price: 0,
				quantity: 1,
				discountAmount: 0,
				discountInput: "0",
				discountMode: "amount",
				total: 0,
			},
		]);
	};

	const removeItem = (index) => {
		const updated = [...items];
		updated.splice(index, 1);
		setItems(updated);
	};

	return (
		<section className="w-full px-4 py-6 bg-[#fffaf0]">
			<div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-[#f4e3d3]">
				{/* Breadcrumbs (Mobile Only) */}
				<div className="block md:hidden text-sm text-gray-500 mb-4">
					<nav className="flex items-center space-x-1">
						<Link className="text-gray-400" href="/dashboard/invoices">
							List Invoice
						</Link>
						<ChevronRight className="w-4 h-4 text-gray-400" />
						<span className="text-gray-700 font-medium">Edit Invoice</span>
					</nav>
				</div>

				<Card className="border-0 shadow-none">
					<CardHeader className="text-center mb-2">
						<CardTitle className="font-bold text-3xl text-[#6D2315]">EDIT INVOICE</CardTitle>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit(onUpdate)} className="space-y-8">
							{/* Basic Info */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div>
									<Label className="py-2 block text-sm text-gray-700">Invoice Number</Label>
									<Controller
										name="invoiceNumber"
										control={control}
										rules={{
											required: "Invoice Number is required!",
											pattern: {
												value: /^\d{4}$/,
												message: "Invoice Number must be exactly 4 digits (0-9)",
											},
										}}
										render={({ field }) => <Input {...field} maxLength={4} required />}
									/>
									{errors.invoiceNumber && (
										<p role="alert" className="text-sm text-red-500">
											{errors.invoiceNumber.message}
										</p>
									)}
								</div>
								<div>
									<Label className="py-2 block text-sm text-gray-700">Buyer Name</Label>
									<Controller
										name="buyerName"
										control={control}
										rules={{
											required: "Buyer Name is required!",
											pattern: {
												value: /^[A-Za-z\s]+$/,
												message: "Buyer Name must contain only letters and spaces",
											},
										}}
										render={({ field }) => <Input {...field} placeholder="Nama pembeli" required />}
									/>
									{errors.buyerName && (
										<p role="alert" className="text-sm text-red-500">
											{errors.buyerName.message}
										</p>
									)}
								</div>
								<div>
									<Label className="py-2 block text-sm text-gray-700">Invoice Date</Label>
									<DatePicker invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate} />
								</div>
								<div className="">
									<Label className="py-2 block text-sm text-gray-700">Status</Label>
									<StatusCombobox value={status} onChange={setStatus} required />
								</div>
							</div>

							{/* Items */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{items.map((item, index) => (
									<div key={index}>
										<h3 className="text-sm font-medium text-[#6D2315] mb-1">Item {index + 1}</h3>

										<div className="bg-[#fffefb] border border-[#fceee4] rounded-md p-4 space-y-3">
											{/* Item Select */}
											<div>
												<Label className="text-sm text-gray-700 mb-1 block">Item</Label>
												<ProductCombobox
													products={products}
													value={item.productId}
													onChange={(val) => handleItemChange(index, "productId", val)}
												/>
											</div>

											{/* Size & Qty */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
												<div>
													<Label className="text-sm text-gray-700 mb-1 block">Size</Label>
													<SizeCombobox
														sizes={sizes}
														value={item.sizePriceId}
														onChange={(val, price) => {
															handleItemChange(index, "sizePriceId", val);
															handleItemChange(index, "price", price);
														}}
													/>
												</div>
												<div>
													<Label className="text-sm text-gray-700 mb-1 block">Qty</Label>
													{/* desktop */}
													<div className="hidden md:block">
														<Input
															type="number"
															value={item.quantity}
															onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
															required
														/>
													</div>

													{/* mobile */}
													<div className="flex items-center gap-2 md:hidden">
														<Input
															type="number"
															value={item.quantity}
															onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
															className="w-15 text-center"
														/>
														<button
															type="button"
															className="w-15 px-2 py-1 border rounded bg-rose-500 text-white"
															onClick={() =>
																handleItemChange(
																	index,
																	"quantity",
																	Math.max(1, Number(item.quantity) - 1)
																)
															}
														>
															-
														</button>
														<button
															type="button"
															className="w-15 px-2 py-1 border rounded bg-emerald-500 text-white"
															onClick={() =>
																handleItemChange(index, "quantity", Number(item.quantity) + 1)
															}
														>
															+
														</button>
													</div>
												</div>
											</div>

											{/* Price & Total */}
											<div className="grid grid-cols-2 gap-2">
												<div>
													<Label className="text-sm text-gray-700 mb-1 block">Price</Label>
													<Input
														type="number"
														value={item.price}
														disabled
														className="bg-gray-100"
													/>
												</div>
												<div>
													<Label className="text-sm text-gray-700 mb-1 block">Total</Label>
													<Input
														value={item.total.toLocaleString("id-ID")}
														disabled
														className="bg-gray-100"
													/>
												</div>
											</div>

											{/* Discount Each Item */}
											<div>
												<Label className="text-sm text-gray-700 mb-1 block">
													Discount (Optional)
												</Label>
												<div className="grid grid-cols-2 gap-2">
													<div>
														<Label className="text-xs text-gray-500">Percent (%)</Label>
														<Input
															type="number"
															placeholder="%"
															min={0}
															max={100}
															step="any"
															value={
																item.discountMode === "percent"
																	? item.discountInput
																	: calculateDiscountPercent(item)
															}
															onChange={(e) =>
																handleItemChange(index, "discountInput", e.target.value, "percent")
															}
														/>
													</div>
													<div>
														<Label className="text-xs text-gray-500">Amount (Rp)</Label>
														<Input
															type="number"
															placeholder="Rp"
															min={0}
															value={
																item.discountMode === "amount"
																	? item.discountInput
																	: item.discountAmount
															}
															onChange={(e) =>
																handleItemChange(index, "discountInput", e.target.value, "amount")
															}
														/>
													</div>
												</div>
											</div>

											{/* Delete button */}
											<div className="flex justify-end">
												<Button
													type="button"
													variant="destructive"
													onClick={() => removeItem(index)}
													className="h-9 px-3"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</div>
								))}

								{/* Add Item Button */}
								<div className="md:col-span-3">
									<Button
										type="button"
										onClick={addItem}
										className="mt-2 bg-[#6D2315] hover:bg-[#591c10] text-white"
									>
										+ Add Item
									</Button>
								</div>
							</div>

							{/* Shipping & Total */}
							<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
								{/* Discount General */}
								<div className="md:col-span-4">
									<div className="bg-[#fffaf0] border border-[#f4e3d3] rounded-md px-4 py-3 h-full">
										<Label className="block text-sm text-gray-700 mb-2">Discount (Optional)</Label>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<Label className="text-xs text-gray-500 mb-1 block">Percent (%)</Label>
												<Input
													type="number"
													min={0}
													max={100}
													step="any"
													value={
														discountMode === "percent"
															? discountInput
															: discountPercent.toFixed(2) || 0
													}
													onChange={(e) => {
														setDiscountMode("percent");
														setDiscountInput(e.target.value);
													}}
												/>
											</div>

											<div>
												<Label className="text-xs text-gray-500 mb-1 block">Amount (Rp)</Label>
												<Input
													type="number"
													min={0}
													value={discountMode === "amount" ? discountInput : discountAmount}
													onChange={(e) => {
														setDiscountMode("amount");
														setDiscountInput(e.target.value);
													}}
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="md:col-span-8 hidden md:block"></div>

								{/* Subtotal */}
								<div className="md:col-span-4">
									<Label className="py-2 block text-sm text-gray-700">Subtotal</Label>
									<Input
										value={subtotal.toLocaleString("id-ID")}
										disabled
										className="bg-gray-100"
									/>
								</div>

								{/* Shipping */}
								<div className="md:col-span-4">
									<Label className="py-2 block text-sm text-gray-700">Shipping Price</Label>
									<Input
										type="number"
										value={shippingPrice}
										onChange={(e) => setShippingPrice(e.target.value)}
									/>
								</div>

								{/* Total */}
								<div className="md:col-span-4">
									<Label className="py-2 block text-sm text-gray-700">Total Price</Label>
									<Input
										value={totalPrice.toLocaleString("id-ID")}
										disabled
										className="bg-gray-100"
									/>
								</div>
							</div>

							<Button type="submit" className="w-full bg-[#6D2315] hover:bg-[#591c10] text-white">
								Save
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
