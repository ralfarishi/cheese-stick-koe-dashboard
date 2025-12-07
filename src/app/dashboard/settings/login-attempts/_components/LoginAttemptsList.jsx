"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteRateLimit } from "@/lib/actions/rate-limit/deleteRateLimit";
import { formatLockoutTime } from "@/lib/utils";
import { Trash2, ShieldAlert, CheckSquare, Square, RefreshCcw, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function LoginAttemptsList({ initialData }) {
	const router = useRouter();
	const [data, setData] = useState(initialData);
	const [selected, setSelected] = useState(new Set());
	const [isDeleting, setIsDeleting] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const toggleSelect = (identifier) => {
		const newSelected = new Set(selected);
		if (newSelected.has(identifier)) {
			newSelected.delete(identifier);
		} else {
			newSelected.add(identifier);
		}
		setSelected(newSelected);
	};

	const toggleSelectAll = () => {
		if (selected.size === data.length) {
			setSelected(new Set());
		} else {
			setSelected(new Set(data.map((item) => item.identifier)));
		}
	};

	const handleDeleteClick = () => {
		if (selected.size === 0) return;
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		setIsDeleting(true);
		const identifiers = Array.from(selected);

		const previousData = [...data];
		setData(data.filter((item) => !selected.has(item.identifier)));
		setSelected(new Set());
		setIsDeleteDialogOpen(false);

		const result = await deleteRateLimit(identifiers);

		if (result.success) {
			toast.success(result.message);
			router.refresh();
		} else {
			toast.error(result.message);
			// Revert on failure
			setData(previousData);
		}
		setIsDeleting(false);
	};

	const formatDate = (timestamp) => {
		if (!timestamp) return "-";
		return new Date(timestamp).toLocaleString();
	};

	const getLockoutStatus = (item) => {
		const now = Date.now();
		if (item.lockedUntil && item.lockedUntil > now) {
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
					Locked ({formatLockoutTime(item.lockedUntil)})
				</span>
			);
		}
		return (
			<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
				Active
			</span>
		);
	};

	if (data.length === 0) {
		return (
			<div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
				<div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
					<ShieldAlert className="w-8 h-8 text-green-600" />
				</div>
				<h3 className="text-lg font-medium text-gray-900">No Active Blocks</h3>
				<p className="text-gray-500 mt-1">There are no tracked login attempts at the moment.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
				<div className="flex items-center gap-4">
					<button
						onClick={toggleSelectAll}
						className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
					>
						{selected.size === data.length && data.length > 0 ? (
							<CheckSquare className="w-5 h-5 text-[#8B2E1F]" />
						) : (
							<Square className="w-5 h-5 text-gray-400" />
						)}
						Select All
					</button>
					<span className="text-sm text-gray-500">{selected.size} selected</span>
				</div>

				{selected.size > 0 && (
					<button
						onClick={handleDeleteClick}
						disabled={isDeleting}
						className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
					>
						{isDeleting ? (
							<RefreshCcw className="w-4 h-4 animate-spin" />
						) : (
							<Trash2 className="w-4 h-4" />
						)}
						Delete Selected ({selected.size})
					</button>
				)}
			</div>

			{/* List */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="bg-gray-50 border-b border-gray-100">
							<tr>
								<th className="px-6 py-4 w-12"></th>
								<th className="px-6 py-4 font-semibold text-gray-900">Identifier</th>
								<th className="px-6 py-4 font-semibold text-gray-900 text-center">Attempts</th>
								<th className="px-6 py-4 font-semibold text-gray-900">Status</th>
								<th className="px-6 py-4 font-semibold text-gray-900">First Attempt</th>
								<th className="px-6 py-4 font-semibold text-gray-900">Locked Until</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{data.map((item) => (
								<tr
									key={item.identifier}
									className={`hover:bg-gray-50 transition-colors ${
										selected.has(item.identifier) ? "bg-orange-50/50" : ""
									}`}
									onClick={() => toggleSelect(item.identifier)}
								>
									<td className="px-6 py-4">
										<div className="flex items-center justify-center">
											{selected.has(item.identifier) ? (
												<CheckSquare className="w-5 h-5 text-[#8B2E1F]" />
											) : (
												<Square className="w-5 h-5 text-gray-300" />
											)}
										</div>
									</td>
									<td className="px-6 py-4 font-medium text-gray-900">{item.identifier}</td>
									<td className="px-6 py-4 text-center">
										<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-semibold text-gray-700">
											{item.attempts}
										</span>
									</td>
									<td className="px-6 py-4">{getLockoutStatus(item)}</td>
									<td className="px-6 py-4 text-gray-500">{formatDate(item.firstAttempt)}</td>
									<td className="px-6 py-4 text-gray-500">{formatDate(item.lockedUntil)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
							<AlertTriangle className="h-6 w-6 text-red-600" />
						</div>
						<DialogTitle className="text-center text-xl">Delete Login Attempts?</DialogTitle>
						<DialogDescription className="text-center pt-2">
							Are you sure you want to delete{" "}
							<span className="font-semibold text-foreground">{selected.size}</span> selected
							record(s)? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="sm:justify-center gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							disabled={isDeleting}
							className="w-full sm:w-auto"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={isDeleting}
							className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
						>
							{isDeleting ? (
								<>
									<RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete Records"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
