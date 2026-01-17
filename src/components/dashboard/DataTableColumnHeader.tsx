"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import type { SortOrder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	column: string;
	sortBy: string;
	sortOrder: SortOrder;
	onSort: (column: string, order: SortOrder) => void;
	hideable?: boolean;
}

export function DataTableColumnHeader({
	title,
	column,
	sortBy,
	sortOrder,
	onSort,
	hideable = false,
	className,
}: DataTableColumnHeaderProps) {
	const isActive = sortBy === column;

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"-ml-3 h-8 data-[state=open]:bg-white/20 hover:bg-white/10 text-white font-bold",
							isActive && "bg-white/10"
						)}
						aria-label={`Sort by ${title}. Current order: ${isActive ? sortOrder : "none"}`}
					>
						<span>{title}</span>
						{isActive ? (
							sortOrder === "desc" ? (
								<ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
							) : (
								<ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
							)
						) : (
							<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" aria-hidden="true" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-48 rounded-xl shadow-xl border-gray-100">
					<DropdownMenuItem
						onClick={() => onSort(column, "asc")}
						className="flex items-center gap-2 cursor-pointer rounded-lg text-gray-700 focus:text-gray-900 focus:bg-gray-50 font-medium"
					>
						<ArrowUp className="h-4 w-4 text-muted-foreground/70" />
						Sort Ascending
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => onSort(column, "desc")}
						className="flex items-center gap-2 cursor-pointer rounded-lg text-gray-700 focus:text-gray-900 focus:bg-gray-50 font-medium"
					>
						<ArrowDown className="h-4 w-4 text-muted-foreground/70" />
						Sort Descending
					</DropdownMenuItem>
					{hideable && (
						<>
							<DropdownMenuSeparator className="my-1 bg-gray-100" />
							<DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg font-medium text-rose-500 focus:text-rose-600 focus:bg-rose-50">
								<EyeOff className="h-4 w-4 text-rose-400" />
								Hide Column
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
