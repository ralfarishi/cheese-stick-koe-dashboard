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
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export default function IngredientCombobox({ ingredients, value, onChange, disabled }) {
	const [open, setOpen] = useState(false);

	const selectedIngredient = ingredients.find((i) => i.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen} modal={true}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"w-full justify-between h-10 px-4 rounded-xl border-gray-200 font-normal hover:bg-gray-50 transition-colors",
						!value && "text-gray-400"
					)}
				>
					<span className="truncate">
						{selectedIngredient
							? `${selectedIngredient.name} (Rp. ${formatCurrency(
									selectedIngredient.costPerUnit
							  )}/${selectedIngredient.unit})`
							: "Search ingredient..."}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
				<Command className="rounded-xl border-none">
					<div className="flex items-center border-b px-3">
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-[#8B2E1F]" />
						<CommandInput
							placeholder="Type name to search..."
							className="h-11 outline-none focus:ring-0 border-none"
						/>
					</div>
					<CommandList className="max-h-[300px] overflow-y-auto">
						<CommandEmpty>No ingredient found.</CommandEmpty>
						<CommandGroup>
							{ingredients.map((ing) => (
								<CommandItem
									key={ing.id}
									value={ing.name}
									onSelect={() => {
										onChange(ing.id);
										setOpen(false);
									}}
									className="flex items-center gap-2 px-3 py-2.5 cursor-pointer aria-selected:bg-[#8B2E1F]/5 aria-selected:text-[#8B2E1F]"
								>
									<Check
										className={cn(
											"h-4 w-4 text-[#8B2E1F]",
											value === ing.id ? "opacity-100" : "opacity-0"
										)}
									/>
									<div className="flex flex-col">
										<span className="font-bold text-gray-900">{ing.name}</span>
										<span className="text-[10px] text-gray-500 uppercase font-medium">
											Rp. {formatCurrency(ing.costPerUnit)} / {ing.unit}
										</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
