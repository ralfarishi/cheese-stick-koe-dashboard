"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
	{ name: "Dashboard", href: "/dashboard" },
	{ name: "Products", href: "/dashboard/products" },
	{ name: "Size & Price", href: "/dashboard/size-pricing" },
	{
		name: "Invoices",
		href: "/dashboard/invoices",
		children: [
			{ name: "List Invoices", href: "/dashboard/invoices" },
			{ name: "Create Invoice", href: "/dashboard/invoices/create" },
		],
	},
];

export function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const handleLogout = async () => {
		try {
			const res = await fetch("/api/logout", {
				method: "POST",
			});
			if (res.ok) {
				router.push("/");
			} else {
				console.error("Logout failed");
			}
		} catch (err) {
			console.error("Logout error:", err);
		}
	};

	return (
		<>
			{/* Burger Icon */}
			<button onClick={() => setOpen(!open)} className="md:hidden p-4 focus:outline-none">
				{open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
			</button>

			{/* Sidebar */}
			<aside
				className={`${
					open ? "block" : "hidden"
				} md:block w-full md:w-64 bg-[#fff7f3] border-r border-[#f1e3db] shadow-sm fixed md:static z-50 top-0 left-0 h-full md:h-auto`}
			>
				{/* Header */}
				<div className="p-4 border-b border-[#f1e3db] flex justify-between items-center bg-[#fff2ea]">
					<h1 className="text-lg font-bold text-[#6D2315] tracking-wide">Invoice App</h1>
					<button onClick={() => setOpen(false)} className="md:hidden">
						<X className="w-5 h-5 text-[#6D2315]" />
					</button>
				</div>

				{/* Nav Items */}
				<nav className="flex flex-col p-4 space-y-2 text-sm text-gray-700">
					{navItems.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

						if (item.children) {
							return (
								<div key={item.href} className="space-y-1">
									<div
										className={`px-3 py-2 rounded-md font-semibold ${
											isActive ? "bg-[#f9e0cd] text-[#6D2315]" : "text-gray-700 hover:bg-[#fceee4]"
										}`}
									>
										{item.name}
									</div>
									<div className="ml-4 space-y-1">
										{item.children.map((child) => (
											<Link
												key={child.href}
												href={child.href}
												className={`block px-3 py-2 rounded-md text-sm ${
													pathname === child.href
														? "bg-[#f9e0cd] text-[#6D2315] font-semibold"
														: "hover:bg-[#fceee4] text-gray-700"
												}`}
												onClick={() => setOpen(false)}
											>
												{child.name}
											</Link>
										))}
									</div>
								</div>
							);
						}

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`px-3 py-2 rounded-md ${
									pathname === item.href
										? "bg-[#f9e0cd] text-[#6D2315] font-semibold"
										: "hover:bg-[#fceee4] text-gray-700"
								}`}
								onClick={() => setOpen(false)}
							>
								{item.name}
							</Link>
						);
					})}

					<button
						onClick={handleLogout}
						className="mt-4 text-sm text-left text-red-500 hover:bg-red-100 px-3 py-2 rounded-md"
					>
						Logout
					</button>
				</nav>
			</aside>
		</>
	);
}
