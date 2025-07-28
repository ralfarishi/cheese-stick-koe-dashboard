"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

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

import { getPageTitle } from "@/lib/utils";
import { ChevronRight, Trash2 } from "lucide-react";

import { toast } from "sonner";

export const metadata = {
	title: getPageTitle("Invoice Edit"),
};

export default function UpdateInvoiceForm({ invoice }) {
	const router = useRouter();
	const supabase = supabaseBrowser();

	const [products, setProducts] = useState([]);
	const [sizes, setSizes] = useState([]);

	const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoiceNumber || "");
	const [buyerName, setBuyerName] = useState(invoice.buyerName || "");
	const [invoiceDate, setInvoiceDate] = useState(invoice.invoiceDate?.split("T")[0] || "");
	const [items, setItems] = useState([]);
	const [shippingPrice, setShippingPrice] = useState(invoice.shipping || 0);
	const [status, setStatus] = useState(invoice.status || "pending");

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
			const mappedItems = invoice.items.map((item) => ({
				productId: item.productId,
				sizePriceId: item.sizePriceId,
				quantity: item.quantity,
				price: item.sizePrice?.price || 0,
				total: item.quantity * (item.sizePrice?.price || 0),
			}));
			setItems(mappedItems);
		}
	}, [invoice]);

	const handleUpdate = async (e) => {
		e.preventDefault();

		const { error } = await supabase
			.from("Invoice")
			.update({
				invoiceNumber,
				buyerName,
				invoiceDate,
				totalPrice,
				shipping: parseInt(shippingPrice),
				status,
			})
			.eq("id", invoice.id);

		if (error) {
			toast.error("Failed to update invoice");
			console.error(error);
		} else {
			await supabase.from("InvoiceItem").delete().eq("invoiceId", invoice.id);

			const itemsToInsert = items.map((item) => ({
				invoiceId: invoice.id,
				productId: item.productId,
				sizePriceId: item.sizePriceId,
				quantity: item.quantity,
				subtotal: item.quantity * (item.price || 0),
			}));

			const { error: itemError } = await supabase.from("InvoiceItem").insert(itemsToInsert);

			if (itemError) {
				toast.error("Failed to update Invoice Item");
				console.error(itemError);
				return;
			}

			toast.success("Invoice has been updated!");
			router.push("/dashboard/invoices");
		}
	};

	const handleItemChange = (index, field, value) => {
		const updatedItems = [...items];

		if (field === "quantity") {
			if (value === "") {
				updatedItems[index][field] = "";
			} else {
				const parsed = parseInt(value, 10);

				if (isNaN(parsed)) {
					toast.error("Field must be number");
					updatedItems[index][field] = "";
				} else if (parsed < 1) {
					toast.error("The value must be 1 or more");
					updatedItems[index][field] = 1;
				} else {
					updatedItems[index][field] = parsed;
				}
			}
		} else {
			updatedItems[index][field] = value;
		}

		// Hitung ulang total
		const price = updatedItems[index].price || 0;
		const quantity = updatedItems[index].quantity || 1;
		updatedItems[index].total = price * quantity;

		setItems(updatedItems);
	};

	const addItem = () => {
		setItems([
			...items,
			{
				productId: "",
				sizePriceId: "",
				price: 0,
				quantity: 1,
				total: 0,
			},
		]);
	};

	const removeItem = (index) => {
		const updated = [...items];
		updated.splice(index, 1);
		setItems(updated);
	};

	const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
	const totalPrice = subtotal + parseInt(shippingPrice || 0);

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
						<form onSubmit={handleUpdate} className="space-y-8">
							{/* Basic Info */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div>
									<Label className="py-2 block text-sm text-gray-700">Invoice Number</Label>
									<Input
										value={invoiceNumber}
										onChange={(e) => setInvoiceNumber(e.target.value)}
										required
									/>
								</div>
								<div>
									<Label className="py-2 block text-sm text-gray-700">Buyer Name</Label>
									<Input
										value={buyerName}
										onChange={(e) => setBuyerName(e.target.value)}
										required
									/>
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

							<div className="space-y-6">
								{items.map((item, index) => (
									<div
										key={index}
										className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-[#fceee4] rounded-md bg-[#fffefb]"
									>
										<div className="md:col-span-4">
											<Label className="mb-1 block text-sm text-gray-700">Items</Label>
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
												value={item.quantity === "" ? "" : item.quantity}
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

							{/* Shipping & Total */}
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
								Save
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
