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
		{ productId: "", sizePriceId: "", quantity: 1, price: 0, total: 0 },
	]);

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
		setItems([...items, { product: "", size: "", quantity: 1, price: 0, total: 0 }]);
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
	const handleItemChange = (index, field, value) => {
		const updatedItems = [...items];

		if (field === "sizePriceId") {
			// Cari harga berdasarkan size ID
			const selectedSize = sizes.find((s) => s.id === value);

			// Update size dan harga
			updatedItems[index].sizePriceId = value;
			updatedItems[index].price = selectedSize?.price || 0;
		} else if (field === "quantity") {
			if (value === "") {
				updatedItems[index].quantity = "";
			} else {
				const parsed = parseInt(value, 10);

				if (isNaN(parsed)) {
					toast.error("Field must be number");
					updatedItems[index].quantity = "";
				} else if (parsed < 1) {
					toast.error("The value must be 1 or more");
					updatedItems[index].quantity = 1;
				} else {
					updatedItems[index].quantity = parsed;
				}
			}
		} else if (field === "price") {
			if (value === "") {
				updatedItems[index].price = value;
			} else {
				const parsed = parseInt(value, 10);
				updatedItems[index].price = isNaN(parsed) ? 0 : parsed;
			}
		} else {
			updatedItems[index][field] = value;
		}

		// Hitung ulang total
		updatedItems[index].total =
			(updatedItems[index].quantity || 0) * (updatedItems[index].price || 0);

		setItems(updatedItems);
	};

	const subtotal = items.reduce((sum, item) => sum + item.total, 0);
	const totalPrice = subtotal + (parseInt(shippingPrice) || 0);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!user) {
			toast.error("User not log in");
			return;
		}

		await submitInvoice({
			invoiceNumber,
			buyerName: buyerName.trim().toLowerCase(),
			invoiceDate,
			shippingPrice,
			totalPrice,
			items,
			user,
			onReset: () => {
				setInvoiceNumber("");
				setBuyerName("");
				setInvoiceDate(new Date().toISOString());
				setShippingPrice(0);
				setItems([
					{
						productId: "",
						sizePriceId: "",
						quantity: 1,
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
										placeholder={`Nomor invoice terakhir: ${lastInvoiceNumber}`}
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
							<div className="space-y-6">
								{items.map((item, index) => (
									<div
										key={index}
										className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-[#fceee4] rounded-md bg-[#fffefb]"
									>
										<div className="md:col-span-4">
											<Label className="mb-1 block text-sm text-gray-700">Item</Label>
											<ProductCombobox
												products={products}
												value={item.productId}
												onChange={(val) => handleItemChange(index, "productId", val)}
											/>
										</div>
										<div className="md:col-span-2">
											<Label className="mb-1 block text-sm text-gray-700">Size</Label>
											<SizeCombobox
												sizes={sizes}
												value={item.sizePriceId}
												onChange={(val, price) => {
													handleItemChange(index, "sizePriceId", val);
													handleItemChange(index, "price", price);
												}}
											/>
										</div>
										<div className="md:col-span-1">
											<Label className="mb-1 block text-sm text-gray-700">Qty</Label>
											<Input
												type="number"
												placeholder="Qty"
												value={item.quantity}
												onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
												required
											/>
										</div>
										<div className="md:col-span-2">
											<Label className="mb-1 block text-sm text-gray-700">Price</Label>
											<Input
												type="number"
												placeholder="Price"
												value={item.price || 0}
												className="bg-gray-100"
												disabled
											/>
										</div>
										<div className="md:col-span-2">
											<Label className="mb-1 block text-sm text-gray-700">Total</Label>
											<Input
												value={item.total.toLocaleString("id-ID")}
												disabled
												className="bg-gray-100"
											/>
										</div>
										<div className="md:col-span-1 flex justify-end mt-2 md:mt-6">
											<Button
												type="button"
												variant="destructive"
												onClick={() => removeItem(index)}
												className="w-full md:w-10 h-10"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}

								<Button
									type="button"
									onClick={addItem}
									className="mt-2 bg-[#6D2315] hover:bg-[#591c10] text-white"
								>
									+ Add Item
								</Button>
							</div>

							{/* Shipping & Totals */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label className="py-2 block text-sm text-gray-700">Shipping Price</Label>
									<Input
										type="number"
										value={shippingPrice}
										onChange={(e) => setShippingPrice(e.target.value)}
									/>
								</div>
								<div>
									<Label className="py-2 block text-sm text-gray-700">Subtotal</Label>
									<Input
										value={subtotal.toLocaleString("id-ID")}
										disabled
										className="bg-gray-100"
									/>
								</div>
								<div>
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
