"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn, getStatusIcons, getStatusVariant, toTitleCase } from "@/lib/utils";

const statuses = [
	{ label: "Pending", value: "pending" },
	{ label: "Success", value: "success" },
	{ label: "Canceled", value: "canceled" },
];

export default function StatusCombobox({ value, onChange, disabled }) {
	const [open, setOpen] = useState(false);

	const selected = statuses.find((s) => s.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"w-full justify-between px-3",
						selected && getStatusVariant(selected.value)
					)}
				>
					{selected ? (
						<span className="flex items-center gap-2">
							{getStatusIcons(selected.value)}
							{selected.label}
						</span>
					) : (
						"Choose status..."
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="Search status..." />
					<CommandList>
						<CommandEmpty>Status not found</CommandEmpty>
						<CommandGroup>
							{statuses.map((s) => (
								<CommandItem
									key={s.value}
									value={s.value}
									className="cursor-pointer"
									onSelect={(currentVal) => {
										onChange(currentVal);
										setOpen(false);
									}}
								>
									<div className="flex items-center gap-2">
										{getStatusIcons(s.value)}
										{s.label}
									</div>
									<Check
										className={cn(
											"ml-auto h-4 w-4",
											value === s.value ? "opacity-100" : "opacity-0"
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
