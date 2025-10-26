"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import AddSizeModal from "./AddSizeModal";
import { Zap } from "lucide-react";

export default function AddSizeButton({ onSizeAdded }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-white text-[#6D2315] hover:bg-[#6D2315] hover:text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105"
      >
        <Zap className="w-5 h-5" />
        Add Size
      </Button>
      <AddSizeModal
        open={open}
        setOpen={setOpen}
        onSuccess={() => {
          onSizeAdded?.();
        }}
      />
    </>
  );
}
