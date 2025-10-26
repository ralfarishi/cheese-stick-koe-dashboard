"use client";

import { forwardRef, useEffect, useState } from "react";

import Image from "next/image";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

import { formatDateFilename, toTitleCase } from "@/lib/utils";
import { CircleUserRound, Landmark } from "lucide-react";

const InvoicePreview = forwardRef(
  (
    {
      invoice,
      invoiceItems,
      shippingType,
      onReady,
      onDataReady,
      isDownloadVersion = false,
    },
    ref,
  ) => {
    const [products, setProducts] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        const { data: productsData } = await getAllProducts();
        const { data: sizeData } = await getAllSizePrice();

        setProducts(productsData || []);
        setSizes(sizeData || []);
      };

      fetchData();
    }, []);

    useEffect(() => {
      if (invoiceItems?.length && products.length && sizes.length) {
        const mappedItems = invoiceItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const size = sizes.find((s) => s.id === item.sizePriceId);
          const price = size?.price || 0;
          const discount = item.discountAmount || 0;
          const quantity = item.quantity;

          return {
            productName: product?.name || "Unknown",
            sizeName: size?.size || "Unknown",
            quantity,
            price,
            discountAmount: discount,
            total: quantity * price - discount,
          };
        });

        setItems(mappedItems);

        onDataReady?.(true);
      } else {
        onDataReady?.(false);
      }
    }, [invoiceItems, products, sizes]);

    useEffect(() => {
      if (!items.length) return;

      const timer = setTimeout(() => {
        onReady?.();
      }, 0);

      return () => clearTimeout(timer);
    }, [items]);

    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const discount = invoice.discount || 0;

    const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;

    const TOTAL_GAP_ROWS = 10;
    const gapRows = Math.max(0, TOTAL_GAP_ROWS - items.length);

    return (
      <>
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Pattaya&family=Poppins:wght@300;400;500;600;700&display=swap");

          .invoice-content {
            font-family: "Poppins", sans-serif;
            background: #ffffff;
          }

          .thanks-msg {
            font-family: "Pattaya", cursive;
          }

          .gradient-border {
            position: relative;
            background: white;
            border: 3px solid #8b2e1f;
          }

          .card-shadow {
            box-shadow: 0 10px 40px rgba(107, 29, 29, 0.15);
          }

          .decorative-dot {
            width: 8px;
            height: 8px;
            background: #d4693c;
            border-radius: 50%;
            display: inline-block;
            margin: 0 8px;
          }

          .wave-divider {
            height: 2px;
            background: linear-gradient(
              90deg,
              transparent,
              #d4693c,
              transparent
            );
            position: relative;
          }
        `}</style>

        <div
          ref={ref}
          className={`invoice-content ${
            isDownloadVersion ? "w-[1080px]" : "w-full md:w-[1080px] md:p-8"
          }`}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div
            className="gradient-border card-shadow rounded-[20px] overflow-hidden"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* Header Section with Brand */}
            <div
              className="p-8 text-white relative overflow-hidden"
              style={{ backgroundColor: "#8B2E1F" }}
            >
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              ></div>
              <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-24 -mb-24"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              ></div>

              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-22 h-22 rounded-full p-0.5"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={85}
                        height={85}
                      />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
                      CHEESE STICK KOE
                    </h1>
                    <p
                      className="text-lg mt-1"
                      style={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      Invoice Pembayaran
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                    <p className="text-lg text-white/80 font-bold">
                      Invoice #{invoice.invoiceNumber}
                    </p>
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    {formatDateFilename(invoice.invoiceDate)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`grid ${isDownloadVersion ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3"} gap-6 p-8`}
              style={{ backgroundColor: "#ffffff" }}
            >
              {/* Left Section - Customer & Payment Info */}
              <div className="space-y-6">
                {/* Customer Info Card */}
                <div
                  className="rounded-2xl p-5 border-2"
                  style={{
                    backgroundColor: "#fff7ed",
                    borderColor: "rgba(212, 105, 60, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: "#8B2E1F" }}
                    >
                      <CircleUserRound width={22} height={22} />
                    </div>
                    <h3 className="font-semibold text-[#6b1d1d] uppercase text-sm">
                      Diberikan Kepada
                    </h3>
                  </div>
                  <p className="text-lg font-semibold text-[#44403c] ml-10">
                    {toTitleCase(invoice.buyerName)}
                  </p>
                </div>

                {/* Bank Details Card */}
                <div
                  className="rounded-2xl p-5 border-2"
                  style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: "#8B2E1F" }}
                    >
                      <Landmark width={20} height={20} />
                    </div>
                    <h3 className="font-semibold text-[#6b1d1d] uppercase text-sm">
                      Detail Bank
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div
                      className="rounded-xl p-4 border-l-4"
                      style={{
                        background:
                          "linear-gradient(to right, #eff6ff, #dbeafe)",
                        borderColor: "#3b82f6",
                      }}
                    >
                      <p
                        className="font-bold text-xs mb-1"
                        style={{ color: "#1e3a8a" }}
                      >
                        BRI
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Ermi Sayekti Endahwati
                        <br />
                        <span
                          className="font-mono font-semibold"
                          style={{ color: "#1d4ed8" }}
                        >
                          0122-01-012734-53-8
                        </span>
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-4 border-l-4"
                      style={{
                        background:
                          "linear-gradient(to right, #eef2ff, #e0e7ff)",
                        borderColor: "#6366f1",
                      }}
                    >
                      <p
                        className="font-bold text-xs mb-1"
                        style={{ color: "#312e81" }}
                      >
                        BCA
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Ermi Sayekti Endahwati
                        <br />
                        <span
                          className="font-mono font-semibold"
                          style={{ color: "#4338ca" }}
                        >
                          524-5031-928
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* QRIS Card */}
                <div
                  className="rounded-2xl p-5 border-2"
                  style={{
                    background:
                      "linear-gradient(to bottom right, #faf5ff, #fce7f3)",
                    borderColor: "#e9d5ff",
                  }}
                >
                  <p
                    className="text-sm font-bold text-center mb-3 uppercase"
                    style={{ color: "#581c87" }}
                  >
                    QRIS a.n Cheese Stick Koe
                  </p>
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <div
                      className="relative w-full aspect-square max-w-[200px] mx-auto rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(to bottom right, #f3e8ff, #fce7f3)",
                      }}
                    >
                      <Image
                        src="/qris.png"
                        width={145}
                        height={145}
                        alt="QRIS"
                      />
                    </div>
                  </div>
                </div>

                {/* Thank You Message */}
                <div className="text-center py-5">
                  <div className="inline-block">
                    <div className="thanks-msg text-3xl font-bold text-amber-800 uppercase tracking-wide">
                      Terima Kasih
                    </div>
                    <div className="flex justify-center mt-2 gap-1">
                      <span className="decorative-dot"></span>
                      <span className="decorative-dot"></span>
                      <span className="decorative-dot"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Invoice Items */}
              <div className="md:col-span-2 space-y-6">
                {/* Items Table */}
                <div
                  className="rounded-2xl overflow-hidden border-2"
                  style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead
                        className="text-white"
                        style={{ backgroundColor: "#8B2E1F" }}
                      >
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold uppercase">
                            Item
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold uppercase">
                            Ukuran
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold uppercase">
                            Jml
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold uppercase">
                            Harga
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold uppercase">
                            Diskon
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item, i) => (
                          <tr
                            key={i}
                            className="hover:bg-orange-50/50 transition-colors"
                            style={{
                              backgroundColor:
                                i % 2 === 0 ? "#ffffff" : "#fffbf5",
                            }}
                          >
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {item.productName}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: "#fed7aa",
                                  color: "#9a3412",
                                }}
                              >
                                {item.sizeName}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold"
                                style={{ backgroundColor: "#f3f4f6" }}
                              >
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">
                              Rp {item.price.toLocaleString("id-ID")}
                            </td>
                            <td
                              className={`px-4 py-3 text-center font-semibold ${
                                item.discountAmount > 0
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {item.discountAmount
                                ? `-Rp ${item.discountAmount.toLocaleString("id-ID")}`
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-800">
                              Rp {item.total.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}

                        {Array.from({ length: gapRows }).map((_, idx) => (
                          <tr key={`gap-${idx}`} className="h-10">
                            <td colSpan="6"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Section */}
                  <div
                    className="border-t-2"
                    style={{
                      background:
                        "linear-gradient(to bottom right, #f9fafb, #fff7ed)",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600 uppercase">
                          Sub Total
                        </span>
                        <span className="text-base font-semibold text-gray-800">
                          Rp {subtotal.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {invoice.discount > 0 && (
                        <div className="flex justify-between items-center py-2 text-green-600">
                          <span className="text-sm font-medium uppercase">
                            Diskon ({discountPercent.toFixed(2)}%)
                          </span>
                          <span className="text-base font-semibold">
                            -Rp {invoice?.discount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600 uppercase">
                          {shippingType ? `Ongkir (${shippingType})` : "Ongkir"}
                        </span>
                        <span className="text-base font-semibold text-gray-800">
                          {invoice.shipping
                            ? `Rp ${invoice.shipping?.toLocaleString("id-ID")}`
                            : "-"}
                        </span>
                      </div>

                      <div
                        className="wave-divider my-3"
                        style={{
                          height: "2px",
                          background:
                            "linear-gradient(to right, transparent, #D4693C, transparent)",
                          position: "relative",
                        }}
                      ></div>

                      <div
                        className="flex justify-between items-center py-3 rounded-xl px-4"
                        style={{
                          background:
                            "linear-gradient(to right, #8B2E1F, #A63825)",
                        }}
                      >
                        <span className="text-sm font-bold text-white uppercase">
                          Jumlah Yang Harus Dibayar
                        </span>
                        <span className="text-xl font-bold text-white">
                          Rp {invoice?.totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div
                  className="border-l-4 rounded-xl p-5"
                  style={{ backgroundColor: "#fef2f2", borderColor: "#ef4444" }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-2xl">⚠️</div>
                    <div>
                      <p
                        className="font-bold text-sm mb-2"
                        style={{ color: "#b91c1c" }}
                      >
                        Disclaimer
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Segala kerusakan yang terjadi selama pengiriman menjadi
                        tanggung jawab pihak ekspedisi. Namun, kami siap
                        membantu proses klaim ke pihak ekspedisi apabila terjadi
                        kendala selama pengiriman.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
);

export default InvoicePreview;
