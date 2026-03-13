"use client";

import { useEffect, useState, ReactNode } from "react";
import dynamic from "next/dynamic";
import { Loader2, TrendingUp, Wallet, Calendar, BarChart3 } from "lucide-react";
import { getIncomeStats } from "@/lib/actions/dashboard/getIncomeStats";

const IncomeChartInner = dynamic(() => import("./IncomeChartInner"), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center h-[320px] bg-gray-50/50 rounded-xl animate-pulse">
			<Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
		</div>
	),
});

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
				className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all min-w-[130px]"
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
					<div
						role="button"
						tabIndex={0}
						aria-label="Close year selector"
						className="fixed inset-0 z-10"
						onClick={() => setOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								setOpen(false);
							}
						}}
					/>
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
		className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors text-gray-700 font-medium"
	>
		{children}
	</button>
);

interface MonthlyData {
	month: string;
	totalIncome: number;
}

interface IncomeChartProps {
	initialData?: MonthlyData[];
}

export default function IncomeChart({ initialData }: IncomeChartProps) {
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [data, setData] = useState<MonthlyData[]>(initialData || []);
	const [loading, setLoading] = useState(false);

	const fetchData = async (year: number): Promise<void> => {
		setLoading(true);
		const stats = await getIncomeStats(year);
		setData(stats || []);
		setLoading(false);
	};

	useEffect(() => {
		if (selectedYear === currentYear && initialData) {
			setData(initialData);
			return;
		}
		fetchData(selectedYear);
	}, [selectedYear, currentYear, initialData]);

	const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

	const totalIncome = data.reduce((sum, item) => sum + item.totalIncome, 0);
	const avgIncome = data.length > 0 ? (totalIncome / data.length) : 0;
	const maxMonth = data.reduce(
		(max, item) => (item.totalIncome > max.totalIncome ? item : max),
		data[0] || { month: "-", totalIncome: 0 },
	);

	const getBarColor = (value: number): string => {
		const maxValue = Math.max(...data.map((d) => d.totalIncome));
		if (maxValue === 0) return "#10b981"; // Fallback
		
		const intensity = value / maxValue;

		if (intensity > 0.8) return "#059669";
		if (intensity > 0.6) return "#10b981";
		if (intensity > 0.4) return "#34d399";
		return "#6ee7b7";
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-gray-50 to-emerald-50 px-6 py-5 border-b border-gray-200">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							<Wallet className="w-6 h-6 text-emerald-600" />
							Income Analytics
						</h2>
						<p className="text-sm text-gray-500 mt-1">Monthly revenue trends</p>
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
				<div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-emerald-500 transition-all">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
									<Wallet className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-gray-500 font-medium">Total Income</p>
									<p className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
										Rp {totalIncome.toLocaleString("id-ID")}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-teal-500 transition-all">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
									<TrendingUp className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-gray-500 font-medium">Avg per Month</p>
									<p className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
										Rp {avgIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-[#10b981] transition-all">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-lg flex items-center justify-center">
									<BarChart3 className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-gray-500 font-medium">Peak Month ({maxMonth?.month || "-"})</p>
									<p className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
										Rp {(maxMonth?.totalIncome || 0).toLocaleString("id-ID")}
									</p>
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
						<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
							<Loader2 className="w-8 h-8 text-white animate-spin" />
						</div>
						<p className="text-gray-500 font-medium">Loading income data...</p>
						<p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<div className="min-w-[700px]">
							<IncomeChartInner data={data} getBarColor={getBarColor} />
						</div>
					</div>
				)}
			</div>

			{/* Footer Info */}
			{!loading && data.length > 0 && (
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
					<div className="flex items-center justify-between text-sm">
						<p className="text-gray-600">
							Showing data for <span className="font-bold text-emerald-600">{selectedYear}</span>
						</p>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded bg-[#059669]"></div>
								<span className="text-gray-600 text-xs">High</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded bg-[#6ee7b7]"></div>
								<span className="text-gray-600 text-xs">Low</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
