import Link from "next/link";
import { unauthorized } from "next/navigation";

import { createClient } from "@/lib/actions/supabase/server";

import { Button } from "@/components/ui/button";

import { getPageTitle, getStatusVariant, toTitleCase } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Package,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import CustomerChart from "@/components/dashboard/CustomerChart";

export const metadata = {
  title: getPageTitle("Dashboard"),
};

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    unauthorized();
  }

  // const user = session.user;

  // get all invoices
  const { data: invoices } = await supabase
    .from("Invoice")
    .select("*")
    .order("invoiceDate", { ascending: false });

  // get total invoice
  const totalInvoices = invoices.length;

  // get latest invoice data
  const latestInvoices = invoices.slice(0, 5);

  // count paid invoices
  const invoicesSuccess = invoices.filter(
    (inv) => inv.status === "success",
  ).length;

  // count unpaid invoices
  const invoicesUnpaid = invoices.filter(
    (inv) => inv.status === "pending",
  ).length;

  // count total customers (unique)
  const { data } = await supabase.from("Invoice").select("buyerName");
  const uniqueCustomers = new Set(
    data.map((d) => d.buyerName.trim().toLowerCase()),
  );
  const totalCustomers = uniqueCustomers.size;

  const totalAmount =
    invoices
      ?.filter((inv) => inv.status === "success")
      .reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;

  // get total products
  const { count: totalProducts } = await supabase
    .from("Product")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#8B2E1F] via-[#A63825] to-[#6D2315] rounded-3xl p-8 shadow-xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    Welcome back, Admin 👋
                  </h1>
                  <p className="text-white/80 text-sm mt-1">
                    Here's what's happening with your store today
                  </p>
                </div>
              </div>
            </div>

            <Link href="/dashboard/invoices/create">
              <Button className="bg-white hover:bg-orange-50 text-[#6D2315] font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105">
                <Zap className="w-5 h-5" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Invoices */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#8B2E1F] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#8B2E1F]/5 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B2E1F] to-[#A63825] rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Total Invoices
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {totalInvoices || 0}
              </p>
            </div>
          </div>

          {/* Total Income */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8%
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Total Income
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                Rp {totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Total Products */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Stable
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Total Products
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {totalProducts}
              </p>
            </div>
          </div>

          {/* Paid Invoices */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {Math.round((invoicesSuccess / totalInvoices) * 100)}%
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Paid Invoices
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {invoicesSuccess}
              </p>
            </div>
          </div>

          {/* Unpaid Invoices */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-rose-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                  {Math.round((invoicesUnpaid / totalInvoices) * 100)}%
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Unpaid Invoices
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {invoicesUnpaid}
              </p>
            </div>
          </div>

          {/* Total Customers */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15%
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Total Customers
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {totalCustomers}
              </p>
            </div>
          </div>
        </div>

        <CustomerChart />

        {/* Latest Invoices Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Latest Invoices
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Recent transactions and their status
              </p>
            </div>
            <Link href="/dashboard/invoices">
              <button className="text-[#8B2E1F] hover:text-[#6D2315] font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                View All
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </Link>
          </div>

          <div className="space-y-3">
            {latestInvoices && latestInvoices.length > 0 ? (
              latestInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="group flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-orange-50 hover:to-red-50 border border-gray-100 hover:border-[#8B2E1F] rounded-2xl p-5 transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  {/* Left Section */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#8B2E1F] to-[#A63825] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        #{inv.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {toTitleCase(inv.buyerName)}
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="text-right space-y-2">
                    <p className="font-bold text-xl text-gray-900">
                      Rp {inv.totalPrice.toLocaleString("id-ID")}
                    </p>
                    <span
                      className={`text-xs font-semibold px-4 py-1.5 inline-flex items-center rounded-full ${getStatusVariant(
                        inv.status,
                      )}`}
                    >
                      {toTitleCase(inv.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No invoice data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
