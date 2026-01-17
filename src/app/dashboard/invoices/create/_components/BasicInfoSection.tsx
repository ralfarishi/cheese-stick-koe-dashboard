"use client";

import { Control, Controller, FieldErrors } from "react-hook-form";
import { Calendar, Receipt, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/dashboard/DatePicker";
import type { CreateInvoiceFormValues } from "../_hooks/useCreateInvoiceItems";

interface BasicInfoSectionProps {
	control: Control<CreateInvoiceFormValues>;
	errors: FieldErrors<CreateInvoiceFormValues>;
	invoiceDate: string;
	setInvoiceDate: (date: string) => void;
	lastInvoiceNumber: string | null;
}

export default function BasicInfoSection({
	control,
	errors,
	invoiceDate,
	setInvoiceDate,
	lastInvoiceNumber,
}: BasicInfoSectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
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
									<Input {...field} placeholder="0000" maxLength={4} className="pl-10" required />
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
							render={({ field }) => <Input {...field} placeholder="Nama pembeli" required />}
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
	);
}
