"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

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
				} md:block w-full md:w-64 bg-white border-r shadow-sm fixed md:static z-50 top-0 left-0 h-full md:h-auto`}
			>
				<div className="p-4 border-b flex justify-between items-center">
					<h1 className="text-lg font-bold">Invoice App</h1>
					{/* Close icon (for mobile) */}
					<button onClick={() => setOpen(false)} className="md:hidden">
						<X className="w-5 h-5" />
					</button>
				</div>

				<nav className="flex flex-col p-4 space-y-2">
					{navItems.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

						if (item.children) {
							return (
								<div key={item.href} className="space-y-1">
									<div
										className={`px-3 py-2 rounded-md font-semibold ${
											isActive ? "bg-sky-200 text-gray-900" : "text-gray-700"
										}`}
									>
										{item.name}
									</div>
									{/* Submenu */}
									<div className="ml-4 space-y-1">
										{item.children.map((child) => (
											<Link
												key={child.href}
												href={child.href}
												className={`block px-3 py-2 rounded-md text-sm ${
													pathname === child.href
														? "bg-sky-200 font-semibold text-gray-900"
														: "hover:bg-sky-100 text-gray-700"
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
										? "bg-sky-200 font-semibold text-gray-900"
										: "hover:bg-sky-100 text-gray-700"
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
