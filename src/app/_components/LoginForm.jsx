"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { login } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ChevronRight,
  Eye,
  EyeClosed,
  LoaderCircle,
  Lock,
  Mail,
} from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast.error("Invalid email format");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email.trim().toLowerCase());
      formData.append("password", data.password);

      const result = await login(formData);

      if (result?.error) {
        toast.error(result.error);
      }
      // Success will be auto-redirect via server action
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cheese Stick Koe
          </h1>
          <p className="text-gray-500">Invoice Management System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-3">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome Back!
            </h2>
            <p className="text-white/80 text-sm">Please login to continue</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-[#8B2E1F]" />
                    Email Address
                  </label>
                  <div className="relative">
                    <Controller
                      name="email"
                      control={control}
                      rules={{ required: "Email is required!" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-11"
                          disabled={isPending}
                          required
                        />
                      )}
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-[#8B2E1F]" />
                    Password
                  </label>
                  <div className="relative">
                    <Controller
                      name="password"
                      control={control}
                      rules={{ required: "Password is required!" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-11 pr-11"
                          disabled={isPending}
                          required
                        />
                      )}
                    />

                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeClosed className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#8B2E1F] focus:ring-[#8B2E1F]"
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                      Remember me
                    </span>
                  </label>
                </div>

                <Button
                  className={`w-full px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPending
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#8B2E1F] to-[#A63825] hover:from-[#6D2315] hover:to-[#8B2E1F] text-white shadow-lg hover:shadow-xl hover:scale-105"
                  }`}
                  type="submit"
                  disabled={isPending}
                  onClick={handleSubmit}
                >
                  {isPending ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          © {new Date().getFullYear()} Cheese Stick Koe. All rights reserved.
        </p>
      </div>
    </div>
  );
}
