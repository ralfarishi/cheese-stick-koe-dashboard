"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
	invoiceDate: string;
	setInvoiceDate: (date: string) => void;
}

function formatDate(date: Date | null): string {
	if (!date) {
		return "";
	}

	return date.toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

export default function DatePicker({ invoiceDate, setInvoiceDate }: DatePickerProps) {
	const [open, setOpen] = useState<boolean>(false);
	const [selectedDate, setSelectedDate] = useState<Date>(
		invoiceDate ? new Date(invoiceDate) : new Date()
	);

	return (
		<div className="flex flex-col gap-3">
			<div className="relative flex gap-2">
				<Input
					id="date"
					value={formatDate(new Date(invoiceDate))}
					placeholder="June 01, 2025"
					className="bg-background pr-10"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const date = new Date(e.target.value);
						if (!isNaN(date.getTime())) {
							date.setHours(12, 0, 0, 0);
							setSelectedDate(date);
							setInvoiceDate(date.toISOString());
						}
					}}
					onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setOpen(true);
						}
					}}
				/>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							id="date-picker"
							variant="ghost"
							className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
						>
							<CalendarIcon className="size-3.5" />
							<span className="sr-only">Select date</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto overflow-hidden p-0"
						align="end"
						alignOffset={-8}
						sideOffset={10}
					>
						<Calendar
							mode="single"
							selected={selectedDate}
							captionLayout="dropdown"
							month={selectedDate}
							onMonthChange={(month: Date) => setSelectedDate(month)}
							onSelect={(date: Date | undefined) => {
								if (date) {
									setSelectedDate(date);

									const withNoon = new Date(date);
									withNoon.setHours(12, 0, 0, 0);
									setInvoiceDate(withNoon.toISOString());

									setOpen(false);
								}
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}

