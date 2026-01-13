"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/dashboard/DatePicker";
import StatusCombobox from "../list/StatusCombobox";
import { Calendar, CircleDot, Receipt, User } from "lucide-react";

export default function BasicInfoSection({
	control,
	errors,
	invoiceDate,
	setInvoiceDate,
	status,
	setStatus,
}) {
	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			<div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-4 border-b border-gray-200">
				<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
					<User className="w-5 h-5 text-[#8B2E1F]" />
					Basic Information
				</h2>
			</div>

			<div className="p-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

					{/* Status */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<CircleDot className="w-4 h-4 text-[#8B2E1F]" />
							Status
						</Label>
						<StatusCombobox value={status} onChange={setStatus} required />
					</div>
				</div>
			</div>
		</div>
	);
}
