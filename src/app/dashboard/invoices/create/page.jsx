"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import DatePicker from "@/components/dashboard/DatePicker";

import ProductCombobox from "./_components/ProductsCombobox";
import SizeCombobox from "./_components/SizeCombobox";

import { ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";
import { submitInvoice } from "@/lib/actions/invoice/submitInvoice";
import { calculateDiscountAmount, calculateDiscountPercent } from "@/lib/utils";

export default function CreateInvoicePage() {
	const supabase = supabaseBrowser();
	const [user, setUser] = useState(null);

	const [products, setProducts] = useState([]);
	const [sizes, setSizes] = useState([]);

	const [buyerName, setBuyerName] = useState("");
	const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString());
	const [invoiceNumber, setInvoiceNumber] = useState("");

	const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null);

	const [shippingPrice, setShippingPrice] = useState(0);
	const [items, setItems] = useState([
		{
			productId: "",
			sizePriceId: "",
			quantity: 1,
			price: 0,
			discountMode: "amount" | "percent",
			discountInput: "",
			discountAmount: 0,
			total: 0,
		},
	]);

	// general discount
	const [discountMode, setDiscountMode] = useState("amount");
	const [discountInput, setDiscountInput] = useState(0);

	useEffect(() => {
		const fetchLastInvoice = async () => {
			const supabase = supabaseBrowser();

			const { data, error } = await supabase
				.from("Invoice")
				.select("invoiceNumber, invoiceDate")
				.order("invoiceDate", { ascending: false })
				.limit(1)
				.single();

			if (data) {
				setLastInvoiceNumber(data.invoiceNumber);
			}
		};

		const getUser = async () => {
			const { data, error } = await supabase.auth.getUser();

			if (error) {
				console.error("Failed to get user:", error.message);
			} else {
				setUser(data.user);
			}
		};

		fetchLastInvoice();
		getUser();
	}, []);

	const addItem = () => {
		setItems([
			...items,
			{
				productId: "",
				sizePriceId: "",
				quantity: 1,
				price: 0,
				discountMode: "amount" | "percent",
				discountInput: "",
				discountAmount: 0,
				total: 0,
			},
		]);
	};

	const removeItem = (index) => {
		const newItems = items.filter((_, i) => i !== index);
		setItems(newItems);
	};

	useEffect(() => {
		(async () => {
			const { data: prods } = await getAllProducts();
			const { data: szs } = await getAllSizePrice();
			setProducts(prods || []);
			setSizes(szs || []);
		})();
	}, []);

	// Kalkulasi total per item dan subtotal
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

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!user) {
			toast.error("User not log in");
			return;
		}

		const isInvalid = items.some((item) => !item.productId || !item.sizePriceId);

		if (isInvalid) {
			toast.error("You must add product and size before submitting!");
			return;
		}

		await submitInvoice({
			invoiceNumber,
			buyerName: buyerName.trim().toLowerCase(),
			invoiceDate,
			shippingPrice,
			discountAmount,
			totalPrice,
			items,
			user,
			onReset: () => {
				setInvoiceNumber("");
				setBuyerName("");
				setInvoiceDate(new Date().toISOString());
				setShippingPrice(0);
				setDiscountInput(0),
					setItems([
						{
							productId: "",
							sizePriceId: "",
							quantity: 1,
							discountAmount: 0,
							price: 0,
							total: 0,
						},
					]);
			},
		});
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
						<span className="text-gray-700 font-medium">Create Invoice</span>
					</nav>
				</div>

				<Card className="border-0 shadow-none">
					<CardHeader className="text-center mb-2">
						<CardTitle className="font-bold text-3xl text-[#6D2315]">INVOICE</CardTitle>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-8">
							{/* Basic Info */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label className="py-2 block text-sm text-gray-700">Invoice Number</Label>
									<Input
										value={invoiceNumber}
										onChange={(e) => setInvoiceNumber(e.target.value)}
										placeholder={`Nomor invoice terakhir: ${lastInvoiceNumber || "0000"}`}
										required
									/>
								</div>
								<div>
									<Label className="py-2 block text-sm text-gray-700">Buyer Name</Label>
									<Input
										value={buyerName}
										onChange={(e) => setBuyerName(e.target.value)}
										placeholder="Nama pembeli"
										required
									/>
								</div>
								<div>
									<Label className="py-2 block text-sm text-gray-700">Invoice Date</Label>
									<DatePicker invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate} />
								</div>
							</div>

							{/* Item List */}
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
											<div className="grid grid-cols-2 gap-2">
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
													<Input
														type="number"
														value={item.quantity}
														onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
														required
													/>
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

											{/* Discount Each Item*/}
											<div>
												<Label className="text-sm text-gray-700 mb-1 block">
													Discount (Optional)
												</Label>
												<div className="grid grid-cols-2 gap-2">
													<Input
														type="number"
														placeholder="%"
														min={0}
														max={100}
														value={
															item.discountMode === "percent"
																? item.discountInput
																: calculateDiscountPercent(item)
														}
														onChange={(e) =>
															handleItemChange(index, "discountInput", e.target.value, "percent")
														}
													/>
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
								Create Invoice
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
