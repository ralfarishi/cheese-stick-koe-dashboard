"use client";

import { TopProductStat } from "@/lib/actions/dashboard/getTopProducts";
import { TopBuyerStat } from "@/lib/actions/dashboard/getTopBuyers";
import { toTitleCase } from "@/lib/utils";
import { Award, Package, Users, TrendingUp } from "lucide-react";

interface TopPerformersProps {
	topProducts: TopProductStat[];
	topBuyers: TopBuyerStat[];
}

export default function TopPerformers({ topProducts, topBuyers }: TopPerformersProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
			{/* Top Products Section */}
			<div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 h-full">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
						<Package className="w-5 h-5 text-white" />
					</div>
					<div>
						<h2 className="text-xl sm:text-2xl font-bold text-gray-900">Top Products</h2>
						<p className="text-xs sm:text-sm text-gray-500 mt-0.5">Best selling items by volume</p>
					</div>
				</div>

				<div className="space-y-3">
					{topProducts.length > 0 ? (
						topProducts.map((product, index) => (
							<div
								key={`${product.productName}-${product.size}`}
								className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors"
							>
								<div className="flex items-center gap-4">
									<div className="font-mono text-sm font-bold text-gray-400 w-4 text-center">
										{index + 1}
									</div>
									<div>
										<p className="font-bold text-gray-900">{product.productName}</p>
										<p className="text-xs text-gray-500 flex items-center gap-1">
											<span className="font-medium bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">
												{product.size}
											</span>
											• {product.totalQuantity} sold
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-bold text-purple-600">
										Rp {product.totalRevenue.toLocaleString("id-ID")}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-8">
							<p className="text-gray-500 text-sm">No product data available yet.</p>
						</div>
					)}
				</div>
			</div>

			{/* Top Buyers Section */}
			<div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100 h-full">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
						<Users className="w-5 h-5 text-white" />
					</div>
					<div>
						<h2 className="text-xl sm:text-2xl font-bold text-gray-900">Top Buyers</h2>
						<p className="text-xs sm:text-sm text-gray-500 mt-0.5">
							Highest lifetime customer value
						</p>
					</div>
				</div>

				<div className="space-y-3">
					{topBuyers.length > 0 ? (
						topBuyers.map((buyer, index) => (
							<div
								key={buyer.buyerName}
								className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors"
							>
								<div className="flex items-center gap-4">
									<div className="relative">
										<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
											<span className="font-bold text-blue-600 text-sm">
												{buyer.buyerName.substring(0, 2).toUpperCase()}
											</span>
										</div>
										{index === 0 && (
											<div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
												<Award className="w-3 h-3 text-white" />
											</div>
										)}
									</div>
									<div>
										<p className="font-bold text-gray-900">{toTitleCase(buyer.buyerName)}</p>
										<p className="text-xs text-gray-500 flex items-center gap-1">
											<TrendingUp className="w-3 h-3" />
											{buyer.totalOrders} orders
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-bold text-blue-600">
										Rp {buyer.totalSpent.toLocaleString("id-ID")}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-8">
							<p className="text-gray-500 text-sm">No buyer data available yet.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
