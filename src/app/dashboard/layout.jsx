import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#fffaf0]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 bg-white rounded-tl-xl md:rounded-tl-none shadow-inner overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
