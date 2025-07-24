import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
	return (
		<div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
			<Sidebar />
			<main className="flex-1 p-4">{children} </main>
		</div>
	);
}
