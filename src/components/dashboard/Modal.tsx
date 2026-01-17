"use client";

import { FormEventHandler, ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, Control, FieldError, RegisterOptions } from "react-hook-form";

type ColorVariant = "default" | "red" | "blue" | "green" | "terracotta";

interface ModalField {
	name?: string;
	label?: string;
	placeholder?: string;
	type?: string;
	value?: string | number;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	required?: boolean;
	error?: FieldError;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control?: Control<any>;
	rules?: RegisterOptions;
}

interface ModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	color?: ColorVariant;
	fields?: ModalField[];
	onSubmit?: FormEventHandler<HTMLFormElement>;
	submitLabel?: string;
	footerButtons?: ReactNode;
	children?: ReactNode;
	buttonStyling?: string;
}

export default function Modal({
	open,
	onOpenChange,
	title,
	color = "default",
	fields = [],
	onSubmit,
	submitLabel = "Submit",
	footerButtons,
	children,
	buttonStyling,
}: ModalProps) {
	const getColorClass = (): string => {
		switch (color) {
			case "red":
				return "text-red-500 font-bold";
			case "blue":
				return "text-blue-500 font-bold";
			case "green":
				return "text-green-500 font-bold";
			case "terracotta":
				return "text-[#8B2E1F] font-black uppercase tracking-tight text-xl";
			default:
				return "font-bold";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-[2rem] border-[#8B2E1F]/10 shadow-[0_32px_64px_-16px_rgba(139,46,31,0.1)] p-8">
				<DialogHeader className="mb-4">
					<DialogTitle className={getColorClass()}>{title}</DialogTitle>
				</DialogHeader>

				{/* CASE 1:  children custom (non-form) */}
				{children && children}

				{!children && fields.length > 0 && (
					<form onSubmit={onSubmit} className="space-y-4 mt-4">
						{fields.map((field) => (
							<div className="space-y-1" key={field.name || field.label || field.placeholder}>
								{field.label && (
									<Label className={field.error ? "text-red-500" : ""} htmlFor={field.name}>
										{field.label}
									</Label>
								)}
								{field.control ? (
									<Controller
										name={field.name || ""}
										control={field.control}
										rules={field.rules}
										render={({ field: { onChange, value, ref } }) => (
											<Input
												id={field.name}
												type={field.type || "text"}
												placeholder={field.placeholder}
												value={value as string}
												onChange={onChange}
												ref={ref}
												className={`${
													color === "terracotta"
														? "h-12 px-4 border-2 border-transparent bg-[#FCF9F1] rounded-xl focus:bg-white focus:border-[#8B2E1F] focus:ring-0 transition-all duration-300 text-[#2D2424] font-medium placeholder:text-gray-300 shadow-none outline-none"
														: ""
												} ${field.error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
											/>
										)}
									/>
								) : (
									<Input
										type={field.type || "text"}
										placeholder={field.placeholder}
										value={field.value}
										onChange={field.onChange}
										required={field.required}
										className={
											color === "terracotta"
												? "h-12 px-4 border-2 border-transparent bg-[#FCF9F1] rounded-xl focus:bg-white focus:border-[#8B2E1F] focus:ring-0 transition-all duration-300 text-[#2D2424] font-medium placeholder:text-gray-300 shadow-none outline-none"
												: ""
										}
									/>
								)}
								{field.error && (
									<p className="text-xs text-red-500 font-medium mt-1">{field.error.message}</p>
								)}
							</div>
						))}
						<DialogFooter className={color === "terracotta" ? "pt-6" : ""}>
							<Button
								type="submit"
								className={`w-full ${buttonStyling || ""} ${
									color === "terracotta"
										? "bg-[#8B2E1F] hover:bg-[#6D2315] text-white h-14 rounded-xl font-bold text-base shadow-[0_8px_16px_-4px_rgba(139,46,31,0.2)] hover:shadow-[0_12px_20px_-4px_rgba(139,46,31,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
										: ""
								}`}
							>
								{submitLabel}
							</Button>
						</DialogFooter>
					</form>
				)}

				{footerButtons && <DialogFooter>{footerButtons}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
}
