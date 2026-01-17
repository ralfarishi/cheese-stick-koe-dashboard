"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { login } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ChevronRight, Eye, EyeClosed, LoaderCircle, Lock } from "lucide-react";
import InteractiveBackground from "./InteractiveBackground";

interface LoginFormValues {
	email: string;
	password: string;
}

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

	const onSubmit = async (data: LoginFormValues): Promise<void> => {
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
		});
	};

	return (
		<div className="min-h-screen w-full bg-[#FCF9F1] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#8B2E1F]/10">
			<InteractiveBackground />
			<div className="relative z-10 w-full max-w-5xl">
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-10"
				>
					{/* Branding Slip - Top Left Staggered */}
					<div className="hidden md:flex w-full md:w-80 bg-[#8B2E1F] p-8 rounded-[1.5rem] shadow-[20px_20px_0px_0px_rgba(139,46,31,0.05)] md:translate-y-[-40px] animate-item-enter group transition-all flex-col duration-500 hover:translate-y-[-45px]">
						<div className="w-16 h-16 bg-[#FCF9F1] rounded-2xl flex items-center justify-center mb-8 shadow-inner">
							<Lock className="w-8 h-8 text-[#8B2E1F]" />
						</div>
						<h1 className="text-4xl font-black text-[#FCF9F1] tracking-tighter leading-tight mb-4">
							Chef Access Only.
						</h1>
						<p className="text-[#FCF9F1]/50 text-xs font-bold uppercase tracking-widest leading-loose">
							Secure Gateway <br /> to the Snack Empire.
						</p>
					</div>

					{/* Form Core Slip - Center Main */}
					<div className="flex-1 w-full max-w-[440px] bg-white p-10 md:p-12 rounded-[2rem] shadow-[0_64px_96px_-32px_rgba(139,46,31,0.08)] border border-[#8B2E1F]/5 animate-fade-in-delay">
						<div className="space-y-10">
							<header>
								<h2 className="text-3xl font-black text-[#2D2424] tracking-tight">
									Identity Check
								</h2>
								<div className="w-12 h-1 bg-[#8B2E1F] mt-3 rounded-full" />
							</header>

							<div className="space-y-8">
								<div className="space-y-3">
									<label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B2E1F]/50 px-1">
										Email
									</label>
									<Controller
										name="email"
										control={control}
										rules={{ required: "Required" }}
										render={({ field }) => (
											<div className="relative group">
												<Input
													{...field}
													type="email"
													placeholder="user@mail.com"
													className="h-14 px-6 border-2 border-[#FCF9F1] bg-[#FCF9F1]/80 rounded-2xl focus:bg-white focus:border-[#8B2E1F] focus:ring-0 transition-all duration-300 text-[#2D2424] font-bold placeholder:text-gray-300 shadow-none outline-none"
													disabled={isPending}
												/>
											</div>
										)}
									/>
								</div>

								<div className="space-y-3">
									<label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B2E1F]/50 px-1">
										Access Key
									</label>
									<Controller
										name="password"
										control={control}
										rules={{ required: "Required" }}
										render={({ field }) => (
											<div className="relative group">
												<Input
													{...field}
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													className="h-14 px-6 border-2 border-[#FCF9F1] bg-[#FCF9F1]/80 rounded-2xl focus:bg-white focus:border-[#8B2E1F] focus:ring-0 transition-all duration-300 text-[#2D2424] font-bold placeholder:text-gray-300 shadow-none outline-none"
													disabled={isPending}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200 hover:text-[#8B2E1F] transition-colors"
												>
													{showPassword ? (
														<EyeClosed className="w-5 h-5" />
													) : (
														<Eye className="w-5 h-5" />
													)}
												</button>
											</div>
										)}
									/>
								</div>
							</div>

							<Button
								className={`w-full h-16 rounded-2xl font-black text-lg transition-all duration-500 overflow-hidden relative group ${
									isPending
										? "bg-gray-100 text-gray-400"
										: "bg-[#8B2E1F] text-white hover:bg-[#6D2315] shadow-[0_12px_24px_-8px_rgba(139,46,31,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(139,46,31,0.4)]"
								}`}
								type="submit"
								disabled={isPending}
							>
								<div className="relative z-10 flex items-center justify-center gap-3">
									{isPending ? (
										<LoaderCircle className="w-6 h-6 animate-spin" />
									) : (
										<>
											<span>Authenticate</span>
											<ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
										</>
									)}
								</div>
							</Button>
						</div>
					</div>

					{/* Metadata Slip - Small Offset Right */}
					<div className="hidden md:flex w-full md:w-64 bg-[#FCF9F1] border-2 border-[#8B2E1F]/35 p-8 rounded-[1.5rem] shadow-[32px_32px_64px_-16px_rgba(139,46,31,0.05)] md:translate-y-[60px] animate-item-enter md:delay-200 flex-col justify-between min-h-[120px] md:min-h-[200px]">
						<div className="space-y-4">
							<div className="flex gap-1">
								{[...Array(3)].map((_, i) => (
									<div key={i} className="w-2 h-2 rounded-full bg-[#8B2E1F]/20" />
								))}
							</div>
							<p className="text-[10px] font-black text-[#8B2E1F]/40 uppercase tracking-[0.25em] leading-relaxed">
								System Version <br /> LTS 2.0.1
							</p>
						</div>
						<p className="text-[9px] font-black text-[#2D2424]/30 uppercase tracking-[0.25em]">
							© {new Date().getFullYear()} CHEESE STICK KOE.
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}
