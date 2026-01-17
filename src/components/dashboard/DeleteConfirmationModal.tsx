"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface DeleteConfirmationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting: boolean;
	title?: string;
	description?: string;
}

export default function DeleteConfirmationModal({
	open,
	onOpenChange,
	onConfirm,
	isDeleting,
	title = "Delete Item",
	description = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
						<AlertTriangle className="h-6 w-6 text-red-600" />
					</div>
					<DialogTitle className="text-center text-xl">{title}</DialogTitle>
					<DialogDescription className="text-center pt-2">{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-center gap-2 mt-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
						className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
					>
						{isDeleting ? (
							<>
								<RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
