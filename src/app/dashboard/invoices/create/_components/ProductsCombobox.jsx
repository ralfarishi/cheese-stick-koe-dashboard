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

import { cn } from "@/lib/utils";

export default function ProductCombobox({ products, value, onChange }) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{value ? products.find((p) => p.id === value)?.name : "Choose item..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="Search item..." />
					<CommandList>
						<CommandEmpty>Item not found</CommandEmpty>
						<CommandGroup>
							{products.map((product) => (
								<CommandItem
									key={product.id}
									value={product.name}
									onSelect={(currentValue) => {
										const selected = products.find((p) => p.name === currentValue);
										if (selected) {
											onChange(selected.id);
											setOpen(false);
										}
									}}
								>
									{product.name}
									<Check
										className={cn(
											"ml-auto h-4 w-4",
											value === product.id ? "opacity-100" : "opacity-0"
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
