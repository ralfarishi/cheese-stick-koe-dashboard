"use client";

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
import { Controller } from "react-hook-form";

export default function Modal({
	open,
	onOpenChange,
	title,
	color = "default", // 'default' | 'red' | 'blue' | 'green' (styling title/button)
	fields = [], // [{ label, placeholder, value, onChange, required }]
	onSubmit,
	submitLabel = "Submit",
	footerButtons, // override footer
	children, // optional custom content
	buttonStyling,
}) {
	const getColorClass = () => {
		switch (color) {
			case "red":
				return "text-red-500";
			case "blue":
				return "text-blue-500";
			case "green":
				return "text-green-500";
			default:
				return "";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
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
										name={field.name}
										control={field.control}
										rules={field.rules}
										render={({ field: { onChange, value, ref } }) => (
											<Input
												id={field.name}
												type={field.type || "text"}
												placeholder={field.placeholder}
												value={value}
												onChange={onChange}
												ref={ref}
												className={field.error ? "border-red-500 focus-visible:ring-red-500" : ""}
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
									/>
								)}
								{field.error && (
									<p className="text-xs text-red-500 font-medium mt-1">{field.error.message}</p>
								)}
							</div>
						))}
						<DialogFooter>
							<Button type="submit" className={`w-full ${buttonStyling}`}>
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
