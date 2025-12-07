import { getRateLimits } from "@/lib/actions/rate-limit/getRateLimits";
import { getPageTitle } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import LoginAttemptsList from "./_components/LoginAttemptsList";

export const metadata = {
	title: getPageTitle("Login Attempts"),
};

export default async function LoginAttemptsPage() {
	const { data: rateLimits } = await getRateLimits();

	return (
		<section className="min-h-screen bg-gray-50/50 p-4 md:p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
							<ShieldAlert className="w-6 h-6 text-[#8B2E1F]" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Login Attempts</h1>
							<p className="text-gray-500">Manage blocked users and view login attempt history</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<LoginAttemptsList initialData={rateLimits || []} />
			</div>
		</section>
	);
}
