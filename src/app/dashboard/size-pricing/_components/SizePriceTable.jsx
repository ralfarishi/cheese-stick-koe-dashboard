"use client";

import { useState, forwardRef, useImperativeHandle } from "react";

import { Button } from "@/components/ui/button";

import EditSizeModal from "./EditSizeModal";
import DeleteSizeModal from "./DeleteSizeModal";

import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";

import AddSizeButton from "./AddSizeButton";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SizePriceTable = forwardRef(function SizePriceTable(
  { data = [], totalPages = 0, totalCount = 0 },
  ref,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedSize, setSelectedSize] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Get current state from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const sortOrder = searchParams.get("sortOrder")?.toString() || "asc";

  const handleSort = () => {
    const params = new URLSearchParams(searchParams);
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    params.set("sortOrder", newOrder);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  useImperativeHandle(ref, () => ({
    refresh: () => router.refresh(),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg border  border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#8B2E1F]" />
              Size & Price List
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track all your size data
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AddSizeButton
              onProductAdded={() => {
                router.refresh();
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold">
                <button
                  onClick={handleSort}
                  className="flex items-center gap-1 hover:text-orange-200 transition-colors"
                >
                  Size
                  {sortOrder === "desc" ? (
                    <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
              <th className="px-6 py-4 text-left text-sm font-bold">
                Created At
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {item.size}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium">
                      Rp. {(item.price || 0).toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-gray-900">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        onClick={() => {
                          setSelectedSize(item);
                          setEditModalOpen(true);
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="Edit Size"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedSize(item);
                          setDeleteModalOpen(true);
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        title="Delete Size"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No size data available
                    </p>
                    <p className="text-sm text-gray-400">
                      Create your first size to get started
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{data.length}</span> of{" "}
              <span className="font-semibold">{totalCount}</span> data
            </p>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    className={`min-w-[40px] ${
                      page === currentPage
                        ? "shadow-lg"
                        : "hover:border-[#8B2E1F] hover:text-[#8B2E1F]"
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DeleteSizeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        sizeId={selectedSize?.id}
        onSuccess={() => {
          router.refresh();
          setSelectedSize(null);
        }}
      />

      <EditSizeModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        data={selectedSize}
        onSuccess={(updatedSize) => {
          router.refresh();
          setSelectedSize(null);
        }}
      />
    </div>
  );
});

export default SizePriceTable;
