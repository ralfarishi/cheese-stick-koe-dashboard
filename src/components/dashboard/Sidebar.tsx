"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import {
	ChevronDown,
	ChevronRight,
	FileText,
	Home,
	LogOut,
	Menu,
	Package,
	Settings,
	Tags,
	X,
	ChefHat,
} from "lucide-react";
import { toast } from "sonner";

import { logout } from "@/lib/actions/auth";

interface NavChild {
	name: string;
	href: string;
}

interface NavItem {
	name: string;
	href: string;
	icon: LucideIcon;
	children?: NavChild[];
}

export function Sidebar() {
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
	const [open, setOpen] = useState<boolean>(false);

	const navItems: NavItem[] = [
		{
			name: "Dashboard",
			href: "/dashboard",
			icon: Home,
		},
		{
			name: "Products",
			href: "/dashboard/products",
			icon: Package,
		},
		{ name: "Size & Price", href: "/dashboard/size-pricing", icon: Tags },
		{ name: "Ingredients", href: "/dashboard/ingredients", icon: ChefHat },
		{
			name: "Invoices",
			href: "/dashboard/invoices",
			icon: FileText,
			children: [
				{ name: "All Invoices", href: "/dashboard/invoices" },
				{ name: "Create Invoice", href: "/dashboard/invoices/create" },
			],
		},
		{
			name: "Settings",
			href: "/dashboard/settings",
			icon: Settings,
			children: [{ name: "Login Attempts", href: "/dashboard/settings/login-attempts" }],
		},
	];

	const handleLogout = (): void => {
		startTransition(async () => {
			try {
				await logout();
				// Server action handles redirect
			} catch (err) {
				// redirect() throws NEXT_REDIRECT which is expected behavior
				const isRedirectError =
					err instanceof Error &&
					(err.message.includes("NEXT_REDIRECT") ||
						(err as Error & { digest?: string }).digest?.includes("NEXT_REDIRECT"));
				if (!isRedirectError) {
					toast.error("Failed to logout. Please try again.");
				}
			}
		});
	};

	const toggleExpand = (href: string): void => {
		setExpandedItems((prev) => ({
			...prev,
			[href]: !prev[href],
		}));
	};

	const isRouteActive = (itemHref: string): boolean => {
		if (itemHref === "/dashboard") return pathname === "/dashboard";
		return pathname === itemHref || pathname.startsWith(itemHref + "/");
	};

	return (
		<>
			<style jsx>{`
				@keyframes sidebar-fade-in {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-sidebar-fade-in {
					animation: sidebar-fade-in 0.3s ease-out;
				}

				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}

				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #f4c7a8;
					border-radius: 3px;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #e5b599;
				}
			`}</style>

			{/* Mobile Burger Button */}
			<button
				onClick={() => setOpen(!open)}
				className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
			>
				{open ? (
					<X className="w-6 h-6 text-[#8B2E1F]" />
				) : (
					<Menu className="w-6 h-6 text-[#8B2E1F]" />
				)}
			</button>

			{/* Overlay for mobile */}
			{open && (
				<div
					className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
					onClick={() => setOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`${
					open ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0 w-72 bg-gradient-to-b from-white to-orange-50 border-r border-gray-200 shadow-xl fixed md:static z-50 top-0 left-0 md:h-screen h-full transition-transform duration-300 ease-in-out`}
			>
				{/* Header with Logo */}
				<div className="relative overflow-hidden bg-gradient-to-r from-[#8B2E1F] to-[#A63825] p-6 border-b border-[#6D2315]">
					{/* Decorative circles */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

					<div className="relative flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
								<FileText className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-white tracking-wide">Cheese Stick Koe</h1>
								<p className="text-xs text-white/70">Invoice Management System</p>
							</div>
						</div>

						<button
							onClick={() => setOpen(false)}
							className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
						>
							<X className="w-5 h-5 text-white" />
						</button>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)] custom-scrollbar">
					{navItems.map((item) => {
						const isActive = isRouteActive(item.href);
						const Icon = item.icon;
						const isExpanded = expandedItems[item.href];
						const hasChildren = item.children && item.children.length > 0;

						if (hasChildren) {
							return (
								<div key={item.href} className="space-y-1">
									{/* Parent Item */}
									<button
										onClick={() => toggleExpand(item.href)}
										className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
											isActive
												? "bg-gradient-to-r from-[#8B2E1F] to-[#A63825] text-white shadow-lg"
												: "text-gray-700 hover:bg-orange-50 hover:shadow-md"
										}`}
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
													isActive
														? "bg-white/20"
														: "bg-orange-100 text-[#8B2E1F] group-hover:bg-orange-200"
												}`}
											>
												<Icon className="w-4 h-4" />
											</div>
											<span className="text-sm">{item.name}</span>
										</div>

										{isExpanded ? (
											<ChevronDown className="w-4 h-4" />
										) : (
											<ChevronRight className="w-4 h-4" />
										)}
									</button>

									{/* Children Items */}
									{isExpanded && (
										<div className="ml-6 pl-4 border-l-2 border-orange-200 space-y-1 animate-sidebar-fade-in">
											{item.children?.map((child) => {
												const isChildActive = pathname === child.href;
												return (
													<Link
														key={child.href}
														href={child.href}
														className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${
															isChildActive
																? "bg-orange-100 text-[#8B2E1F] font-semibold shadow-sm"
																: "text-gray-600 hover:bg-orange-50 hover:text-[#8B2E1F]"
														}`}
														onClick={() => setOpen(false)}
													>
														<div className="flex items-center gap-2">
															<div
																className={`w-1.5 h-1.5 rounded-full ${
																	isChildActive ? "bg-[#8B2E1F]" : "bg-gray-400"
																}`}
															/>
															{child.name}
														</div>
													</Link>
												);
											})}
										</div>
									)}
								</div>
							);
						}

						// Single Item (no children)
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
									isActive
										? "bg-gradient-to-r from-[#8B2E1F] to-[#A63825] text-white shadow-lg"
										: "text-gray-700 hover:bg-orange-50 hover:shadow-md"
								}`}
								onClick={() => setOpen(false)}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
										isActive
											? "bg-white/20"
											: "bg-orange-100 text-[#8B2E1F] group-hover:bg-orange-200"
									}`}
								>
									<Icon className="w-4 h-4" />
								</div>
								<span className="text-sm">{item.name}</span>
							</Link>
						);
					})}

					{/* Logout Button */}
					<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent border-t border-gray-200">
						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold transition-all duration-300 hover:shadow-lg group"
						>
							<div className="w-8 h-8 rounded-lg bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center transition-colors">
								<LogOut className="w-4 h-4" />
							</div>
							<span className="text-sm">{isPending ? "Logging out..." : "Logout"}</span>
						</button>
					</div>
				</nav>
			</aside>
		</>
	);
}
