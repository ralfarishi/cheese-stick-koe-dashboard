"use client";

export default function UpdateStatusOverlay({ isPending, updateStatus }) {
	if (!isPending && !updateStatus) return null;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl border border-gray-100 max-w-sm w-full">
				{updateStatus === "loading" && <LoadingState />}
				{updateStatus === "success" && <SuccessState />}
			</div>
		</div>
	);
}

function LoadingState() {
	return (
		<>
			<div className="relative">
				<div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#8B2E1F]"></div>
				<div className="absolute inset-0 flex items-center justify-center">
					<svg
						className="w-8 h-8 text-[#8B2E1F] animate-pulse"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
			</div>

			<div className="text-center space-y-2">
				<h3 className="text-xl font-bold text-gray-900">Updating Invoice</h3>
				<p className="text-sm text-gray-500">Please wait while we save your changes...</p>
			</div>

			<div className="flex gap-2">
				<span
					className="w-2 h-2 bg-[#8B2E1F] rounded-full animate-bounce"
					style={{ animationDelay: "0ms" }}
				></span>
				<span
					className="w-2 h-2 bg-[#8B2E1F] rounded-full animate-bounce"
					style={{ animationDelay: "150ms" }}
				></span>
				<span
					className="w-2 h-2 bg-[#8B2E1F] rounded-full animate-bounce"
					style={{ animationDelay: "300ms" }}
				></span>
			</div>
		</>
	);
}

function SuccessState() {
	return (
		<>
			<div className="relative">
				<div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-scale-in">
					<svg
						className="w-10 h-10 text-emerald-600 animate-check"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
					</svg>
				</div>

				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-24 h-24 rounded-full border-4 border-emerald-400 animate-ping opacity-75"></div>
				</div>
			</div>

			<div className="text-center space-y-2">
				<h3 className="text-xl font-bold text-emerald-600 animate-fade-in">
					Successfully Updated!
				</h3>
				<p className="text-sm text-gray-500 animate-fade-in-delay">
					Redirecting to invoice list...
				</p>
			</div>
		</>
	);
}
