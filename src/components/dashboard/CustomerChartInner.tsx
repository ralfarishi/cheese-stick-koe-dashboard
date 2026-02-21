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
import { Users } from "lucide-react";

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

interface CustomerChartInnerProps {
	data: MonthlyData[];
	getBarColor: (value: number) => string;
}

export default function CustomerChartInner({ data, getBarColor }: CustomerChartInnerProps) {
	return (
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
				<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139, 46, 31, 0.1)" }} />
				<Bar dataKey="totalCustomer" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={50}>
					{data.map((entry) => (
						<Cell key={`cell-${entry.month}`} fill={getBarColor(entry.totalCustomer)} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}
