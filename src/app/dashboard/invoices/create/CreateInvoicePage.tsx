"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { User } from "@supabase/supabase-js";

import { supabaseBrowser } from "@/lib/actions/supabase/browser";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { toast } from "sonner";

import { submitInvoice } from "@/lib/actions/invoice/submitInvoice";

import CreateInvoiceHeader from "./_components/CreateInvoiceHeader";
import BasicInfoSection from "./_components/BasicInfoSection";
import ItemsSection from "./_components/ItemsSection";
import SummarySection from "./_components/SummarySection";
import {
	useCreateInvoiceItems,
	type ProductOption,
	type SizeOption,
	type CreateInvoiceFormValues,
} from "./_hooks/useCreateInvoiceItems";

interface CreateInvoicePageProps {
	products: ProductOption[];
	sizes: SizeOption[];
}

export default function CreateInvoicePage({
	products: initialProducts,
	sizes: initialSizes,
}: CreateInvoicePageProps) {
	const supabase = supabaseBrowser();
	const [user, setUser] = useState<User | null>(null);

	const [products] = useState<ProductOption[]>(initialProducts || []);
	const [sizes] = useState<SizeOption[]>(initialSizes || []);

	const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString());
	const [lastInvoiceNumber, setLastInvoiceNumber] = useState<string | null>(null);
	const [shippingPrice, setShippingPrice] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// General discount state
	const [discountMode, setDiscountMode] = useState<"amount" | "percent">("amount");
	const [discountInput, setDiscountInput] = useState<number>(0);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CreateInvoiceFormValues>({
		defaultValues: {
			invoiceNumber: "",
			buyerName: "",
			shippingPrice: "",
		},
		mode: "onChange",
	});

	const {
		items,
		addItem,
		removeItem,
		handleItemChange,
		resetItems,
		subtotal: itemsTotal,
	} = useCreateInvoiceItems({ sizes });

	const resetForm = () => {
		setInvoiceDate(new Date().toISOString());
		setShippingPrice(0);
		setDiscountInput(0);
		resetItems();
	};

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
	}, [supabase]);

	// Calculate discount based on items total
	const discountAmount =
		discountMode === "percent"
			? Math.round((discountInput / 100) * itemsTotal)
			: discountInput || 0;

	const discountPercent =
		discountMode === "amount" && itemsTotal > 0
			? (discountInput / itemsTotal) * 100
			: discountInput || 0;

	// Subtotal = items total - general discount
	const subtotal = itemsTotal - discountAmount;

	// Total = Subtotal + Shipping
	const totalPrice = subtotal + shippingPrice;

	const onSubmit = async (data: CreateInvoiceFormValues): Promise<void> => {
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
				shipping: shippingPrice,
				shippingPrice,
				discountAmount,
				totalPrice,
				items: items.map((item) => ({
					productId: item.productId,
					sizePriceId: item.sizePriceId,
					quantity: item.quantity,
					subtotal: item.quantity * item.price,
					discountAmount: item.discountAmount,
				})),
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
		} catch {
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="min-h-screen bg-orange-50 px-4 py-8">
			<div className="max-w-7xl mx-auto">
				<CreateInvoiceHeader />

				<div className="space-y-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						<BasicInfoSection
							control={control}
							errors={errors}
							invoiceDate={invoiceDate}
							setInvoiceDate={setInvoiceDate}
							lastInvoiceNumber={lastInvoiceNumber}
						/>

						<ItemsSection
							items={items}
							products={products}
							sizes={sizes}
							onItemChange={handleItemChange}
							onRemove={removeItem}
							onAdd={addItem}
						/>

						<SummarySection
							control={control}
							errors={errors}
							subtotal={subtotal}
							shippingPrice={shippingPrice}
							setShippingPrice={setShippingPrice}
							discountMode={discountMode}
							setDiscountMode={setDiscountMode}
							discountInput={discountInput}
							setDiscountInput={setDiscountInput}
							discountAmount={discountAmount}
							discountPercent={discountPercent}
							totalPrice={totalPrice}
						/>

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

