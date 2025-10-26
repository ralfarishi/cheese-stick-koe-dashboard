import Link from "next/link";

import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="relative inline-block">
            <span className="text-[120px] sm:text-[180px] lg:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#6d2315] to-[#a83a28] leading-none tracking-tighter">
              404
            </span>
          </h1>
        </div>

        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Oops! Page Not Found
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
            The page you&apos;re looking for seems to have wandered off.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="mt-10 flex justify-center sm:flex-row gap-4 w-full max-w-md px-4">
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-[#6d2315] text-white rounded-xl font-medium shadow-lg shadow-[#6d2315]/20 hover:shadow-xl hover:shadow-[#6d2315]/30 hover:bg-[#5a1d11] transition-all duration-300 hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
