"use client";

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
import { Wallet } from "lucide-react";

interface TooltipPayload {
	payload: { month: string; totalIncome: number };
	value: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-slate-100 border-2 border-[#10b981] rounded-xl shadow-xl p-4">
				<p className="text-sm font-semibold text-gray-700 mb-1">{payload[0].payload.month}</p>
				<p className="text-lg font-bold text-[#10b981] flex items-center gap-2">
					<Wallet className="w-4 h-4" />
					Rp {payload[0].value.toLocaleString("id-ID")}
				</p>
			</div>
		);
	}
	return null;
};

interface MonthlyData {
	month: string;
	totalIncome: number;
}

interface IncomeChartInnerProps {
	data: MonthlyData[];
	getBarColor: (value: number) => string;
}

export default function IncomeChartInner({ data, getBarColor }: IncomeChartInnerProps) {
	return (
		<ResponsiveContainer width="100%" height={320}>
			<BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
				<defs>
					<linearGradient id="incomeBarGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#10b981" stopOpacity={1} />
						<stop offset="100%" stopColor="#34d399" stopOpacity={1} />
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
					tickFormatter={(value) => {
						if (value >= 1000000) {
							return `Rp${(value / 1000000).toFixed(1)}M`;
						}
						if (value >= 1000) {
							return `Rp${(value / 1000).toFixed(0)}k`;
						}
						return `Rp${value}`;
					}}
				/>
				<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16, 185, 129, 0.1)" }} />
				<Bar dataKey="totalIncome" fill="url(#incomeBarGradient)" radius={[8, 8, 0, 0]} maxBarSize={50}>
					{data.map((entry) => (
						<Cell key={`cell-${entry.month}`} fill={getBarColor(entry.totalIncome)} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}
