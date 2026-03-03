import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/actions/supabase/server";
import { unauthorized } from "next/navigation";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		unauthorized();
	}

	return (
		<div className="h-screen flex flex-col md:flex-row bg-[#fffaf0]">
			<Sidebar />
			<main className="flex-1 p-4 md:p-6 bg-white rounded-tl-xl md:rounded-tl-none shadow-inner overflow-y-auto">
				{children}
			</main>
		</div>
	);
}

