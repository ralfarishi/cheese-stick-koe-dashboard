"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Controller, useForm } from "react-hook-form";

import { supabaseBrowser } from "@/lib/actions/supabase/browser";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import DatePicker from "@/components/dashboard/DatePicker";

import ProductCombobox from "./_components/ProductsCombobox";
import SizeCombobox from "./_components/SizeCombobox";
import InvoiceItemCard from "../_components/form/InvoiceItemCard";

import {
	Calendar,
	ChevronRight,
	DollarSign,
	Package,
	Percent,
	Plus,
	Receipt,
	Tag,
	Trash2,
	User,
} from "lucide-react";
import { toast } from "sonner";

import { submitInvoice } from "@/lib/actions/invoice/submitInvoice";
import { calculateDiscountAmount, calculateDiscountPercent } from "@/lib/utils";

export default function CreateInvoicePage({ products: initialProducts, sizes: initialSizes }) {
	const supabase = supabaseBrowser();
	const [user, setUser] = useState(null);

	const [products, setProducts] = useState(initialProducts || []);
	const [sizes, setSizes] = useState(initialSizes || []);

	const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString());

	const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null);

	const [shippingPrice, setShippingPrice] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		defaultValues: {
			invoiceNumber: "",
			buyerName: "",
			shippingPrice: "",
		},
		mode: "onChange",
	});

	const resetForm = () => {
		setInvoiceDate(new Date().toISOString());
		setShippingPrice(0);
		setDiscountInput(0);
		setItems([createEmptyItem()]);
	};

	const createEmptyItem = () => ({
		productId: "",
		sizePriceId: "",
		quantity: 1,
		price: 0,
		discountMode: "amount" | "percent",
		discountInput: "",
		discountAmount: 0,
		total: 0,
	});

	const [items, setItems] = useState([createEmptyItem()]);

	// general discount
	const [discountMode, setDiscountMode] = useState("amount");
	const [discountInput, setDiscountInput] = useState(0);

	useEffect(() => {
		const fetchInitialData = async () => {
			const [{ data: userData }, { data: lastInvoice }] = await Promise.all([
				supabase.auth.getUser(),
				supabase
					.from("Invoice")
					.select("invoiceNumber, invoiceDate")
					.order("invoiceDate", { ascending: false })
					.limit(1)
					.single(),
			]);

			if (userData?.user) setUser(userData.user);
			if (lastInvoice) setLastInvoiceNumber(lastInvoice.invoiceNumber);
		};

		fetchInitialData();
	}, []);

	const addItem = () => {
		setItems([...items, createEmptyItem()]);
	};

	const removeItem = (index) => {
		setItems((prev) => prev.filter((_, i) => i !== index));
	};

	// calculate each item total and subtotal
	const updateItemField = (item, field, value, mode = null) => {
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
	};

	const handleItemChange = (index, field, value, mode = null) => {
		const updatedItems = [...items];
		const item = updatedItems[index];

		updateItemField(item, field, value, mode);
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

	const onSubmit = async (data) => {
		if (!user) {
			toast.error("User not log in");
			return;
		}

		const isInvalid = items.some((item) => !item.productId || !item.sizePriceId);

		if (isInvalid) {
			toast.error("You must add product and size before submitting!");
			return;
		}

		setIsLoading(true);

		try {
			const res = await submitInvoice({
				invoiceNumber: data.invoiceNumber,
				buyerName: data.buyerName.trim().toLowerCase(),
				invoiceDate,
				shippingPrice,
				discountAmount,
				totalPrice,
				items,
				user,
			});

			if (res.error) {
				toast.error(res.error);
				return;
			}

			toast.success(res.message);

			reset({
				invoiceNumber: "",
				buyerName: "",
			});

			resetForm();
		} catch (error) {
			toast.error(res.message || "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-8">
			<div className="max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="mb-8">
					{/* Breadcrumbs Mobile */}
					<div className="block md:hidden mb-4">
						<nav className="flex items-center gap-2 text-sm mt-6">
							<Link
								href="/dashboard/invoices"
								className="text-gray-500 hover:text-[#8B2E1F] transition-colors"
							>
								List Invoice
							</Link>
							<ChevronRight className="w-4 h-4 text-gray-400" />
							<span className="text-[#8B2E1F] font-semibold">Create Invoice</span>
						</nav>
					</div>

					{/* Page Title */}
					<div className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] rounded-2xl p-6 md:p-8 shadow-xl">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
								<Receipt className="w-8 h-8 text-white" />
							</div>
							<div>
								<h1 className="text-3xl md:text-4xl font-bold text-white">Create New Invoice</h1>
								<p className="text-white/80 text-sm mt-1">
									Fill in the details to generate a new invoice
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						{/* Basic Information Card */}
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-4 border-b border-gray-200">
								<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
									<User className="w-5 h-5 text-[#8B2E1F]" />
									Basic Information
								</h2>
							</div>

							<div className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{/* Invoice Number */}
									<div className="space-y-2">
										<Label className="flex items-center gap-2">
											<Receipt className="w-4 h-4 text-[#8B2E1F]" />
											Invoice Number
										</Label>
										<div className="relative">
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
												render={({ field }) => (
													<Input
														{...field}
														placeholder="0000"
														maxLength={4}
														className="pl-10"
														required
													/>
												)}
											/>
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
												#
											</span>
										</div>
										<p className="text-xs text-gray-500">
											Invoice terakhir: {`${lastInvoiceNumber || "0000"}`}
										</p>
										{errors.invoiceNumber && (
											<p role="alert" className="text-sm text-red-500">
												{errors.invoiceNumber.message}
											</p>
										)}
									</div>

									{/* Buyer Name */}
									<div className="space-y-2">
										<Label className="flex items-center gap-2">
											<User className="w-4 h-4 text-[#8B2E1F]" />
											Buyer Name
										</Label>
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
											render={({ field }) => (
												<Input {...field} placeholder="Nama pembeli" required />
											)}
										/>
										{errors.buyerName && (
											<p role="alert" className="text-sm text-red-500">
												{errors.buyerName.message}
											</p>
										)}
									</div>

									{/* Invoice Date */}
									<div className="space-y-2">
										<Label className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-[#8B2E1F]" />
											Invoice Date
										</Label>
										<DatePicker invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate} />
									</div>
								</div>
							</div>
						</div>

						{/* Items Section */}
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
										<Package className="w-5 h-5 text-purple-600" />
										Invoice Items
									</h2>
									<span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
										{items.length} {items.length === 1 ? "Item" : "Items"}
									</span>
								</div>
							</div>

							<div className="p-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
									{items.map((item, index) => (
										<InvoiceItemCard
											key={index}
											item={item}
											index={index}
											itemsLength={items.length}
											products={products}
											sizes={sizes}
											onItemChange={handleItemChange}
											onRemove={removeItem}
											ProductCombobox={ProductCombobox}
											SizeCombobox={SizeCombobox}
										/>
									))}
								</div>

								{/* Add Item Button */}
								<div className="mt-6 flex justify-start">
									<Button type="button" onClick={addItem} className="w-full md:w-auto">
										<Plus className="w-5 h-5" />
										Add Item
									</Button>
								</div>
							</div>
						</div>

						{/* Summary Section */}
						<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-gray-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
								<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
									<DollarSign className="w-5 h-5 text-emerald-600" />
									Invoice Summary
								</h2>
							</div>

							<div className="p-6 space-y-6">
								{/* General Discount */}
								<div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
									<Label className="text-sm font-bold text-amber-900 uppercase flex items-center gap-2 mb-4">
										<Tag className="w-4 h-4" />
										General Discount (Optional)
									</Label>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label className="text-xs text-gray-600 flex items-center gap-1">
												<Percent className="w-3 h-3" />
												Percent (%)
											</Label>
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
												className="bg-white"
											/>
										</div>

										<div className="space-y-2">
											<Label className="text-xs text-gray-600">Amount (Rp)</Label>
											<Input
												type="number"
												min={0}
												value={discountMode === "amount" ? discountInput : discountAmount}
												onChange={(e) => {
													setDiscountMode("amount");
													setDiscountInput(e.target.value);
												}}
												className="bg-white"
											/>
										</div>
									</div>
								</div>

								{/* Calculation Grid */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{/* Subtotal */}
									<div className="space-y-2">
										<Label className="text-sm font-semibold text-gray-700">Subtotal</Label>
										<div className="relative">
											<Input
												disabled
												value={subtotal.toLocaleString("id-ID")}
												className="bg-gray-50 font-mono text-lg font-semibold pl-10"
											/>
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
												Rp
											</span>
										</div>
									</div>

									{/* Shipping */}
									<div className="space-y-2">
										<Label className="text-sm font-semibold text-gray-700">Shipping Price</Label>
										<div className="relative">
											<Controller
												name="shippingPrice"
												control={control}
												rules={{
													min: {
														value: 0,
														message: "Shipping cannot be less than 0",
													},
												}}
												render={({ field }) => (
													<Input
														{...field}
														type="number"
														value={shippingPrice}
														className="font-mono pl-10"
														onChange={(e) => {
															field.onChange(e);
															setShippingPrice(e.target.value);
														}}
													/>
												)}
											/>
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
												Rp
											</span>
										</div>
										{errors.shippingPrice && (
											<p role="alert" className="text-sm text-red-500">
												{errors.shippingPrice.message}
											</p>
										)}
									</div>

									{/* Total */}
									<div className="space-y-2">
										<Label className="text-sm font-bold text-emerald-700">Total Price</Label>
										<div className="relative">
											<Input
												disabled
												value={totalPrice.toLocaleString("id-ID")}
												className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 font-mono text-lg font-bold text-emerald-700 pl-10"
											/>
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
												Rp
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex justify-center">
							<Button
								type="submit"
								className="w-full md:w-auto md:min-w-[300px] py-4 text-lg"
								disabled={isLoading}
							>
								{isLoading ? (
									"Loading..."
								) : (
									<>
										<Receipt className="w-5 h-5" />
										Create Invoice
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

