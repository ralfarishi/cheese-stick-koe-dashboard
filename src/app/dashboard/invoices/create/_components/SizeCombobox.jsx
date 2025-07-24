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

export default function SizeCombobox({ sizes, value, onChange }) {
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
					{value ? sizes.find((s) => s.id === value)?.size : "Choose size..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="Search size..." />
					<CommandList>
						<CommandEmpty>Size not found</CommandEmpty>
						<CommandGroup>
							{sizes.map((s) => (
								<CommandItem
									key={s.id}
									value={s.size}
									onSelect={() => {
										onChange(s.id, s.price);
										setOpen(false);
									}}
									// value={s.id}
									// onSelect={(currentId) => {
									// 	const selected = sizes.find((sz) => sz.id === currentId);
									// 	if (selected) {
									// 		onChange(selected.id, selected.price);
									// 		setOpen(false);
									// 	}
									// }}
								>
									{s.size}
									<Check
										className={cn("ml-auto h-4 w-4", value === s.id ? "opacity-100" : "opacity-0")}
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
