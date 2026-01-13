"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPageTitle } from "@/lib/utils";

import SizeCombobox from "../../create/_components/SizeCombobox";
import ProductCombobox from "../../create/_components/ProductsCombobox";

import { useInvoiceForm } from "../../_hooks/useInvoiceForm";
import UpdateStatusOverlay from "./UpdateStatusOverlay";
import InvoiceFormHeader from "./InvoiceFormHeader";
import BasicInfoSection from "./BasicInfoSection";
import ItemsSection from "./ItemsSection";
import SummarySection from "./SummarySection";

export const metadata = {
	title: getPageTitle("Invoice Edit"),
};

export default function UpdateInvoiceForm({ invoice, productsData = [], sizesData = [] }) {
	const [products] = useState(productsData);

	const {
		form,
		isPending,
		updateStatus,
		items,
		invoiceDate,
		setInvoiceDate,
		status,
		setStatus,
		shippingPrice,
		setShippingPrice,
		discountMode,
		discountInput,
		discountAmount,
		discountPercent,
		handleDiscountChange,
		subtotal,
		totalPrice,
		handleItemChange,
		addItem,
		removeItem,
		onSubmit,
	} = useInvoiceForm({ invoice, sizesData });

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = form;

	return (
		<section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-8">
			<UpdateStatusOverlay isPending={isPending} updateStatus={updateStatus} />

			<div className="max-w-7xl mx-auto">
				<InvoiceFormHeader
					title="Update Invoice"
					subtitle="Update the details to modify the existing invoice"
				/>

				<div className="space-y-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						<BasicInfoSection
							control={control}
							errors={errors}
							invoiceDate={invoiceDate}
							setInvoiceDate={setInvoiceDate}
							status={status}
							setStatus={setStatus}
						/>

						<ItemsSection
							items={items}
							products={products}
							sizes={sizesData}
							onItemChange={handleItemChange}
							onRemove={removeItem}
							onAdd={addItem}
							ProductCombobox={ProductCombobox}
							SizeCombobox={SizeCombobox}
						/>

						<SummarySection
							control={control}
							errors={errors}
							subtotal={subtotal}
							discountMode={discountMode}
							discountInput={discountInput}
							discountAmount={discountAmount}
							discountPercent={discountPercent}
							shippingPrice={shippingPrice}
							totalPrice={totalPrice}
							onDiscountChange={handleDiscountChange}
							onShippingChange={setShippingPrice}
						/>

						{/* Submit Button */}
						<div className="flex justify-center">
							<Button type="submit" className="w-full md:w-auto md:min-w-[300px] py-4 text-lg">
								Update
							</Button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}
