export default function UnauthorizedPage() {
	return (
		<main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
			<div className="text-center">
				<p className="text-9xl font-semibold text-[#6d2315]">401</p>
				<h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-500 sm:text-5xl">
					Unauthorized Access
				</h1>
				<p className="mt-6 text-lg leading-8 text-gray-400">
					Sorry, you don&apos;t have permission to access this page. account.
				</p>
			</div>
		</main>
	);
}
