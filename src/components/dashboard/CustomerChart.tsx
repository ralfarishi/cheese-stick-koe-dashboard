"use client";

import { useEffect, useState, ReactNode } from "react";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
	Cell,
} from "recharts";
import { Loader2, TrendingUp, Users, Calendar, BarChart3 } from "lucide-react";

import { getCustomerStats } from "@/lib/actions/invoice/getCustomerStats";

interface SelectProps {
	value: string;
	onValueChange: (value: string) => void;
	children: ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#8B2E1F] focus:outline-none focus:ring-2 focus:ring-[#8B2E1F] focus:border-transparent transition-all min-w-[130px]"
			>
				<Calendar className="w-4 h-4 text-gray-500" />
				<span className="font-semibold text-gray-700">{value}</span>
				<svg
					className="w-4 h-4 ml-auto text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{open && (
				<>
					<div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
					<div className="absolute right-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
						{children}
					</div>
				</>
			)}
		</div>
	);
};

interface SelectItemProps {
	value: string;
	children: ReactNode;
	onSelect: (value: string) => void;
}

const SelectItem = ({ value, children, onSelect }: SelectItemProps) => (
	<button
		onClick={() => onSelect(value)}
		className="w-full px-4 py-2.5 text-left hover:bg-orange-50 transition-colors text-gray-700 font-medium"
	>
		{children}
	</button>
);

interface TooltipPayload {
	payload: { month: string };
	value: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-slate-100 border-2 border-[#8B2E1F] rounded-xl shadow-xl p-4">
				<p className="text-sm font-semibold text-gray-700 mb-1">{payload[0].payload.month}</p>
				<p className="text-lg font-bold text-[#8B2E1F] flex items-center gap-2">
					<Users className="w-4 h-4" />
					{payload[0].value} Customers
				</p>
			</div>
		);
	}
	return null;
};

interface MonthlyData {
	month: string;
	totalCustomer: number;
}

interface CustomerChartProps {
	initialData?: MonthlyData[];
}

export default function CustomerChart({ initialData }: CustomerChartProps) {
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [data, setData] = useState<MonthlyData[]>(initialData || []);
	const [loading, setLoading] = useState(false);

	const fetchData = async (year: number): Promise<void> => {
		setLoading(true);
		const stats = await getCustomerStats(year);

		// Removed artificial delay
		setData(stats);
		setLoading(false);
	};

	useEffect(() => {
		if (selectedYear === currentYear && initialData) {
			setData(initialData);
			return;
		}
		fetchData(selectedYear);
	}, [selectedYear, currentYear, initialData]);

	const years = [currentYear - 1, currentYear, currentYear + 1];

	const totalCustomers = data.reduce((sum, item) => sum + item.totalCustomer, 0);
	const avgCustomers = data.length > 0 ? (totalCustomers / data.length).toFixed(1) : "0";
	const maxMonth = data.reduce(
		(max, item) => (item.totalCustomer > max.totalCustomer ? item : max),
		data[0] || { month: "-", totalCustomer: 0 }
	);

	const getBarColor = (value: number): string => {
		const maxValue = Math.max(...data.map((d) => d.totalCustomer));
		const intensity = value / maxValue;

		if (intensity > 0.8) return "#8B2E1F";
		if (intensity > 0.6) return "#A63825";
		if (intensity > 0.4) return "#C44530";
		return "#D4693C";
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-5 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							<BarChart3 className="w-6 h-6 text-purple-600" />
							Customer Analytics
						</h2>
						<p className="text-sm text-gray-500 mt-1">Monthly customer acquisition trends</p>
					</div>

					<Select
						value={String(selectedYear)}
						onValueChange={(val) => setSelectedYear(Number(val))}
					>
						{years.map((y) => (
							<SelectItem
								key={y}
								value={String(y)}
								onSelect={(val) => setSelectedYear(Number(val))}
							>
								{y}
							</SelectItem>
						))}
					</Select>
				</div>
			</div>

			{/* Stats Cards */}
			{!loading && data.length > 0 && (
				<div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-[#8B2E1F] transition-all">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-br from-[#8B2E1F] to-[#A63825] rounded-lg flex items-center justify-center">
									<Users className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-gray-500 font-medium">Customers per Month</p>
									<p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-purple-500 transition-all">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
									<TrendingUp className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-gray-500 font-medium">Avg per Month</p>
									<p className="text-2xl font-bold text-gray-900">{avgCustomers}</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-emerald-500 transition-all">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
									<BarChart3 className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-gray-500 font-medium">Peak Month</p>
									<p className="text-2xl font-bold text-gray-900">{maxMonth?.month || "-"}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Chart Content */}
			<div className="p-6">
				{loading ? (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-16 h-16 bg-gradient-to-br from-[#8B2E1F] to-[#A63825] rounded-2xl flex items-center justify-center mb-4 animate-pulse">
							<Loader2 className="w-8 h-8 text-white animate-spin" />
						</div>
						<p className="text-gray-500 font-medium">Loading customer data...</p>
						<p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<div className="min-w-[700px]">
							<ResponsiveContainer width="100%" height={320}>
								<BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
									<defs>
										<linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#8B2E1F" stopOpacity={1} />
											<stop offset="100%" stopColor="#D4693C" stopOpacity={1} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
									<XAxis
										dataKey="month"
										tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
										axisLine={{ stroke: "#d1d5db" }}
									/>
									<YAxis
										domain={[0, "auto"]}
										tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
										axisLine={{ stroke: "#d1d5db" }}
									/>
									<Tooltip
										content={<CustomTooltip />}
										cursor={{ fill: "rgba(139, 46, 31, 0.1)" }}
									/>
									<Bar
										dataKey="totalCustomer"
										fill="url(#barGradient)"
										radius={[8, 8, 0, 0]}
										maxBarSize={50}
									>
										{data.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={getBarColor(entry.totalCustomer)} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				)}
			</div>

			{/* Footer Info */}
			{!loading && data.length > 0 && (
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
					<div className="flex items-center justify-between text-sm">
						<p className="text-gray-600">
							Showing data for <span className="font-bold text-[#8B2E1F]">{selectedYear}</span>
						</p>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded bg-[#8B2E1F]"></div>
								<span className="text-gray-600 text-xs">High</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded bg-[#D4693C]"></div>
								<span className="text-gray-600 text-xs">Low</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

