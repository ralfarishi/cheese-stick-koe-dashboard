"use client";

import { useReducer, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { User } from "@supabase/supabase-js";

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
	lastInvoiceNumber: string | null;
	user: User;
}

type InvoiceState = {
	invoiceDate: string;
	shippingPrice: number;
	isLoading: boolean;
	discountMode: "amount" | "percent";
	discountInput: number;
};

type InvoiceAction =
	| { type: "SET_DATE"; payload: string }
	| { type: "SET_SHIPPING"; payload: number }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_DISCOUNT_MODE"; payload: "amount" | "percent" }
	| { type: "SET_DISCOUNT_INPUT"; payload: number }
	| { type: "RESET_STATE" };

const invoiceReducer = (state: InvoiceState, action: InvoiceAction): InvoiceState => {
	switch (action.type) {
		case "SET_DATE":
			return { ...state, invoiceDate: action.payload };
		case "SET_SHIPPING":
			return { ...state, shippingPrice: action.payload };
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		case "SET_DISCOUNT_MODE":
			return { ...state, discountMode: action.payload };
		case "SET_DISCOUNT_INPUT":
			return { ...state, discountInput: action.payload };
		case "RESET_STATE":
			return {
				...state,
				invoiceDate: new Date().toISOString(),
				shippingPrice: 0,
				discountInput: 0,
			};
		default:
			return state;
	}
};

export default function CreateInvoicePage({
	products,
	sizes,
	lastInvoiceNumber,
	user,
}: CreateInvoicePageProps) {
	const [state, dispatch] = useReducer(invoiceReducer, {
		invoiceDate: new Date().toISOString(),
		shippingPrice: 0,
		isLoading: false,
		discountMode: "amount",
		discountInput: 0,
	});

	const { invoiceDate, shippingPrice, isLoading, discountMode, discountInput } = state;

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
		dispatch({ type: "RESET_STATE" });
		resetItems();
	};

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

		dispatch({ type: "SET_LOADING", payload: true });

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
			dispatch({ type: "SET_LOADING", payload: false });
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
							setInvoiceDate={(val: string) => dispatch({ type: "SET_DATE", payload: val })}
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
							setShippingPrice={(val: number) => dispatch({ type: "SET_SHIPPING", payload: val })}
							discountMode={discountMode}
							setDiscountMode={(val: "amount" | "percent") =>
								dispatch({ type: "SET_DISCOUNT_MODE", payload: val })
							}
							discountInput={discountInput}
							setDiscountInput={(val: number) =>
								dispatch({ type: "SET_DISCOUNT_INPUT", payload: val })
							}
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

