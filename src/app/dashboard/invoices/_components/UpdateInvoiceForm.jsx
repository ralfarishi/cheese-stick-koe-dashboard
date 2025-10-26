"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import DatePicker from "@/components/dashboard/DatePicker";

import ProductCombobox from "../create/_components/ProductsCombobox";
import SizeCombobox from "../create/_components/SizeCombobox";
import StatusCombobox from "./StatusCombobox";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";
import { updateInvoice } from "@/lib/actions/invoice/updateInvoice";

import {
  calculateDiscountAmount,
  calculateDiscountPercent,
  getPageTitle,
} from "@/lib/utils";

import {
  Calendar,
  ChevronRight,
  DollarSign,
  Package,
  Percent,
  Plus,
  Receipt,
  Tag,
  Trash2,
  User,
  CircleDot,
} from "lucide-react";

import { toast } from "sonner";

export const metadata = {
  title: getPageTitle("Invoice Edit"),
};

export default function UpdateInvoiceForm({ invoice }) {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [invoiceDate, setInvoiceDate] = useState(
    invoice.invoiceDate?.split("T")[0] || "",
  );
  const [items, setItems] = useState([]);
  const [shippingPrice, setShippingPrice] = useState(invoice.shipping || 0);
  const [status, setStatus] = useState(invoice.status || "pending");

  const [discountMode, setDiscountMode] = useState("amount");
  const [discountInput, setDiscountInput] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoiceNumber: invoice.invoiceNumber || "",
      buyerName: invoice.buyerName || "",
    },
    mode: "onChange",
  });

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
    if (invoice?.items?.length) {
      const mappedItems = invoice.items.map((item) => {
        const quantity = item.quantity || 0;
        const price = item.sizePrice?.price || 0;
        const subtotal = quantity * price;

        const discountAmount = item.discountAmount || 0;

        return {
          productId: item.productId,
          sizePriceId: item.sizePriceId,
          quantity,
          price,
          discountAmount,
          discountInput: String(discountAmount),
          discountMode: "amount",
          total: subtotal - discountAmount,
        };
      });

      setItems(mappedItems);
    }

    if (invoice?.discount !== undefined) {
      setDiscountInput(String(invoice.discount));
      setDiscountMode("amount");
    }
  }, [invoice]);

  const onUpdate = async (data) => {
    const isInvalid = items.some(
      (item) => !item.productId || !item.sizePriceId,
    );

    if (isInvalid) {
      toast.error("You must add product and size before submitting!");
      return;
    }

    const result = await updateInvoice({
      invoiceId: invoice.id,
      invoiceData: {
        invoiceNumber: data.invoiceNumber,
        buyerName: data.buyerName.trim().toLowerCase(),
        invoiceDate,
        totalPrice,
        discount: discountAmount,
        shipping: parseInt(shippingPrice),
        status,
      },
      items,
    });

    if (!result.success) {
      toast.error(result.error || "Failed to update invoice");
      return;
    }

    toast.success("Invoice has been updated!");
    router.push("/dashboard/invoices");
  };

  const handleItemChange = (index, field, value, mode = null) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    if (field === "sizePriceId") {
      const selectedSize = sizes.find((s) => s.id === value);
      item.sizePriceId = value;
      item.price = selectedSize?.price || 0;
    } else if (field === "quantity") {
      const parsed = parseInt(value, 10);
      item.quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    } else if (field === "price") {
      const parsed = parseInt(value, 10);
      item.price = isNaN(parsed) ? 0 : parsed;
    } else if (field === "discountMode") {
      item.discountMode = value;
    } else if (field === "discountInput") {
      item.discountInput = value;
      item.discountMode = mode;
    } else {
      item[field] = value;
    }

    const qty = item.quantity || 0;
    const price = item.price || 0;

    const rawTotal = qty * price;

    const discountAmount = calculateDiscountAmount({
      quantity: item.quantity,
      price: item.price,
      discountInput: item.discountInput,
      discountMode: item.discountMode,
    });

    item.discountAmount = discountAmount;
    item.total = rawTotal - discountAmount;

    setItems(updatedItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const discountAmount =
    discountMode === "percent"
      ? Math.round(((parseFloat(discountInput) || 0) / 100) * subtotal)
      : parseInt(discountInput) || 0;

  const discountPercent =
    discountMode === "amount"
      ? ((parseInt(discountInput) || 0) / subtotal) * 100
      : parseFloat(discountInput) || 0;

  const totalPrice = subtotal + (parseInt(shippingPrice) || 0) - discountAmount;

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        sizePriceId: "",
        price: 0,
        quantity: 1,
        discountAmount: 0,
        discountInput: "0",
        discountMode: "amount",
        total: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          {/* Breadcrumbs Mobile */}
          <div className="block md:hidden mb-4">
            <nav className="flex items-center gap-2 text-sm mt-6">
              <Link
                href="/dashboard/invoices"
                className="text-gray-500 hover:text-[#8B2E1F] transition-colors"
              >
                List Invoice
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-[#8B2E1F] font-semibold">
                Update Invoice
              </span>
            </nav>
          </div>

          {/* Page Title */}
          <div className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Update Invoice
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Update the details to modify the existing invoice
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit(onUpdate)} className="space-y-8">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#8B2E1F]" />
                  Basic Information
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Invoice Number */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#8B2E1F]" />
                      Invoice Number
                    </Label>
                    <div className="relative">
                      <Controller
                        name="invoiceNumber"
                        control={control}
                        rules={{
                          required: "Invoice Number is required!",
                          pattern: {
                            value: /^\d{4}$/,
                            message:
                              "Invoice Number must be exactly 4 digits (0-9)",
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="0000"
                            maxLength={4}
                            className="pl-10"
                            required
                          />
                        )}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                        #
                      </span>
                    </div>
                    {errors.invoiceNumber && (
                      <p role="alert" className="text-sm text-red-500">
                        {errors.invoiceNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Buyer Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#8B2E1F]" />
                      Buyer Name
                    </Label>
                    <Controller
                      name="buyerName"
                      control={control}
                      rules={{
                        required: "Buyer Name is required!",
                        pattern: {
                          value: /^[A-Za-z\s]+$/,
                          message:
                            "Buyer Name must contain only letters and spaces",
                        },
                      }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Nama pembeli" required />
                      )}
                    />
                    {errors.buyerName && (
                      <p role="alert" className="text-sm text-red-500">
                        {errors.buyerName.message}
                      </p>
                    )}
                  </div>

                  {/* Invoice Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#8B2E1F]" />
                      Invoice Date
                    </Label>
                    <DatePicker
                      invoiceDate={invoiceDate}
                      setInvoiceDate={setInvoiceDate}
                    />
                  </div>

                  {/* Status*/}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CircleDot className="w-4 h-4 text-[#8B2E1F]" />
                      Status
                    </Label>
                    <StatusCombobox
                      value={status}
                      onChange={setStatus}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Invoice Items
                  </h2>
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-[#8B2E1F] rounded-2xl p-5 transition-all duration-300 hover:shadow-xl"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#8B2E1F] to-[#A63825] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-700">
                            Item {index + 1}
                          </span>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Product Selection */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-600 uppercase">
                            Product
                          </Label>
                          <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-500">
                            <ProductCombobox
                              products={products}
                              value={item.productId}
                              onChange={(val) =>
                                handleItemChange(index, "productId", val)
                              }
                            />
                          </div>
                        </div>

                        {/* Size & Quantity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-600 uppercase">
                              Size
                            </Label>
                            <SizeCombobox
                              sizes={sizes}
                              value={item.sizePriceId}
                              onChange={(val, price) => {
                                handleItemChange(index, "sizePriceId", val);
                                handleItemChange(index, "price", price);
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-600 uppercase">
                              Quantity
                            </Label>
                            {/* Desktop */}
                            <div className="hidden md:block">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className="font-semibold text-center"
                              />
                            </div>
                            {/* Mobile */}
                            <div className="flex items-center gap-2 md:hidden">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className="w-20 text-center"
                              />
                              <button
                                type="button"
                                className="w-15 px-2 py-1 border rounded bg-rose-500 text-white"
                                onClick={() =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    Math.max(1, Number(item.quantity) - 1),
                                  )
                                }
                              >
                                -
                              </button>
                              <button
                                type="button"
                                className="w-15 px-2 py-1 border rounded bg-emerald-500 text-white"
                                onClick={() =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    Number(item.quantity) + 1,
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price & Total */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              Price
                            </Label>
                            <Input
                              type="number"
                              disabled
                              value={item.price}
                              className="bg-gray-50 font-mono"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
                              <Receipt className="w-3 h-3" />
                              Total
                            </Label>
                            <Input
                              disabled
                              value={item.total.toLocaleString("id-ID")}
                              className="bg-emerald-50 font-mono font-semibold text-emerald-700"
                            />
                          </div>
                        </div>

                        {/* Item Discount */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                          <Label className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Discount (Optional)
                          </Label>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600 flex items-center gap-1">
                                <Percent className="w-3 h-3" />
                                Percent
                              </Label>
                              <Input
                                type="number"
                                placeholder="%"
                                min={0}
                                max={100}
                                step="any"
                                value={
                                  item.discountMode === "percent"
                                    ? item.discountInput
                                    : calculateDiscountPercent(item)
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "discountInput",
                                    e.target.value,
                                    "percent",
                                  )
                                }
                                className="bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">
                                Amount (Rp)
                              </Label>
                              <Input
                                type="number"
                                placeholder="Rp"
                                min={0}
                                value={
                                  item.discountMode === "amount"
                                    ? item.discountInput
                                    : item.discountAmount
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "discountInput",
                                    e.target.value,
                                    "amount",
                                  )
                                }
                                className="bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Button */}
                <div className="mt-6 flex justify-start">
                  <Button
                    type="button"
                    onClick={addItem}
                    className="w-full md:w-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Invoice Summary
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* General Discount */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                  <Label className="text-sm font-bold text-amber-900 uppercase flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4" />
                    General Discount (Optional)
                  </Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        Percent (%)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={
                          discountMode === "percent"
                            ? discountInput
                            : discountPercent.toFixed(2) || 0
                        }
                        onChange={(e) => {
                          setDiscountMode("percent");
                          setDiscountInput(e.target.value);
                        }}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">
                        Amount (Rp)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={
                          discountMode === "amount"
                            ? discountInput
                            : discountAmount
                        }
                        onChange={(e) => {
                          setDiscountMode("amount");
                          setDiscountInput(e.target.value);
                        }}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Subtotal */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Subtotal
                    </Label>
                    <div className="relative">
                      <Input
                        disabled
                        value={subtotal.toLocaleString("id-ID")}
                        className="bg-gray-50 font-mono text-lg font-semibold pl-10"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        Rp
                      </span>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Shipping Price
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={shippingPrice}
                        className="font-mono pl-10"
                        onChange={(e) => setShippingPrice(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        Rp
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-emerald-700">
                      Total Price
                    </Label>
                    <div className="relative">
                      <Input
                        disabled
                        value={totalPrice.toLocaleString("id-ID")}
                        className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 font-mono text-lg font-bold text-emerald-700 pl-10"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                        Rp
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                className="w-full md:w-auto md:min-w-[300px] py-4 text-lg"
              >
                Update
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
