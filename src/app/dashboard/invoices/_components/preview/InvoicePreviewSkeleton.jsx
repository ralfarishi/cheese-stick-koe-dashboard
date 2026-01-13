"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicePreviewSkeleton({ isDownloadVersion = false }) {
	return (
		<div
			className={`invoice-content ${
				isDownloadVersion ? "w-[1080px]" : "w-full md:w-[1080px] md:p-8"
			}`}
			style={{ backgroundColor: "#ffffff" }}
		>
			<div
				className="gradient-border card-shadow rounded-[20px] overflow-hidden"
				style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
			>
				{/* Header Skeleton */}
				<div className="p-8 bg-gray-50 border-b border-gray-100">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex items-center gap-4">
							<Skeleton className="w-20 h-20 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-8 w-64" />
								<Skeleton className="h-5 w-40" />
							</div>
						</div>
						<div className="text-right space-y-2">
							<Skeleton className="h-10 w-48 ml-auto rounded-lg" />
							<Skeleton className="h-4 w-32 ml-auto" />
						</div>
					</div>
				</div>

				<div
					className={`grid ${
						isDownloadVersion ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3"
					} gap-6 p-8`}
				>
					{/* Left Section Skeleton */}
					<div className="space-y-6">
						<div className="rounded-2xl p-5 border-2 border-gray-100 space-y-4">
							<div className="flex items-center gap-2">
								<Skeleton className="w-8 h-8 rounded-full" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-6 w-48 ml-10" />
						</div>

						<div className="rounded-2xl p-5 border-2 border-gray-100 space-y-4">
							<div className="flex items-center gap-2">
								<Skeleton className="w-8 h-8 rounded-full" />
								<Skeleton className="h-4 w-24" />
							</div>
							<div className="space-y-4">
								<Skeleton className="h-24 w-full rounded-xl" />
								<Skeleton className="h-24 w-full rounded-xl" />
							</div>
						</div>

						<div className="rounded-2xl p-5 border-2 border-gray-100 space-y-3">
							<Skeleton className="h-4 w-40 mx-auto" />
							<Skeleton className="w-40 h-40 mx-auto rounded-lg" />
						</div>
					</div>

					{/* Right Section Skeleton */}
					<div className="md:col-span-2 space-y-6">
						<div className="rounded-2xl overflow-hidden border-2 border-gray-100">
							<div className="p-4 bg-gray-50 border-b border-gray-100">
								<div className="grid grid-cols-6 gap-4">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
								</div>
							</div>
							<div className="p-4 space-y-4">
								{[1, 2, 3, 4, 5].map((i) => (
									<div key={i} className="grid grid-cols-6 gap-4">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
									</div>
								))}
							</div>
							<div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">
								<div className="flex justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-32" />
								</div>
								<div className="flex justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-32" />
								</div>
								<Skeleton className="h-px w-full my-2" />
								<div className="flex justify-between">
									<Skeleton className="h-6 w-32" />
									<Skeleton className="h-6 w-40" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
