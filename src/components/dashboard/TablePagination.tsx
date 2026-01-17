"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	itemsShown: number;
	onPageChange: (page: number) => void;
	itemLabel?: string;
}

export function TablePagination({
	currentPage,
	totalPages,
	totalCount,
	itemsShown,
	onPageChange,
	itemLabel = "items",
}: TablePaginationProps) {
	const isFirstPage = currentPage <= 1;
	const isLastPage = currentPage >= totalPages;

	const handlePrevious = () => {
		if (!isFirstPage) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (!isLastPage) {
			onPageChange(currentPage + 1);
		}
	};

	if (totalPages <= 0) {
		return null;
	}

	return (
		<nav
			role="navigation"
			aria-label="Pagination"
			className="px-6 py-4 bg-gray-50 border-t border-gray-200"
		>
			<div className="flex items-center justify-between flex-wrap gap-3">
				{/* Items count */}
				<p className="text-sm text-gray-600">
					Showing <span className="font-semibold">{itemsShown}</span> of{" "}
					<span className="font-semibold">{totalCount}</span> {itemLabel}
				</p>

				{/* Pagination controls */}
				<div className="flex items-center gap-2">
					{/* Previous button */}
					<Button
						variant="outline"
						size="sm"
						onClick={handlePrevious}
						disabled={isFirstPage}
						aria-label="Go to previous page"
						className="h-9 px-3 gap-1 font-medium hover:border-[#8B2E1F] hover:text-[#8B2E1F] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<ChevronLeft className="h-4 w-4" />
						<span className="hidden sm:inline">Previous</span>
					</Button>

					{/* Page indicator */}
					<div
						className="flex items-center justify-center min-w-[120px] h-9 px-4 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700"
						aria-live="polite"
						aria-atomic="true"
					>
						<span>
							Page{" "}
							<span className="font-bold text-[#8B2E1F]" aria-current="page">
								{currentPage}
							</span>{" "}
							of <span className="font-bold">{totalPages}</span>
						</span>
					</div>

					{/* Next button */}
					<Button
						variant="outline"
						size="sm"
						onClick={handleNext}
						disabled={isLastPage}
						aria-label="Go to next page"
						className="h-9 px-3 gap-1 font-medium hover:border-[#8B2E1F] hover:text-[#8B2E1F] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span className="hidden sm:inline">Next</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</nav>
	);
}
