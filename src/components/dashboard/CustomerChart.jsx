"use client";

import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Loader2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getCustomerStats } from "@/lib/actions/invoice/getCustomerStats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function CustomerChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (year) => {
    setLoading(true);
    const stats = await getCustomerStats(year);
    setData(stats);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <Card className="bg-white border border-[#f4e3d3] shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-[#6D2315] font-medium">
          Customer per Month
        </CardTitle>
        <Select
          value={String(selectedYear)}
          onValueChange={(val) => setSelectedYear(Number(val))}
        >
          <SelectTrigger className="w-[130px] border-[#e5d4c0] focus:ring-[#6D2315]/30 focus:border-[#6D2315]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[5, 25]} ticks={[5, 10, 15, 20, 25]} />
                  <Tooltip />
                  <Bar dataKey="totalCustomer" fill="#6D2315" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
