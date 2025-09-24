"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Loader2Icon, LockIcon } from "lucide-react";

import { Controller, useForm } from "react-hook-form";

export default function LoginForm() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// set loading state false when route change complete
		const handleComplete = () => setLoading(false);

		// Listen to route change events
		router.events?.on("routeChangeComplete", handleComplete);
		router.events?.on("routeChangeError", handleComplete);

		return () => {
			router.events?.off("routeChangeComplete", handleComplete);
			router.events?.off("routeChangeError", handleComplete);
		};
	}, [router]);

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
		try {
			setLoading(true);
			const supabase = supabaseBrowser();
			const { error } = await supabase.auth.signInWithPassword({
				email: data.email,
				password: data.password,
			});

			if (error) throw error;

			await router.push("/dashboard");
		} catch (err) {
			toast.error(err.message);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#fef6f3] to-[#f1f5f9]">
			<Card className="w-full max-w-md shadow-xl border border-gray-200">
				<CardHeader className="text-center space-y-2">
					<div className="flex justify-center">
						<div className="w-14 h-14 rounded-full bg-[#6d2315] text-white flex items-center justify-center text-2xl font-bold">
							<LockIcon />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-[#6d2315]">Welcome Back</CardTitle>
					<p className="text-sm text-gray-500">Please login to your account</p>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-1">
							<label htmlFor="email" className="text-sm font-medium text-gray-700">
								Email
							</label>
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
										required
									/>
								)}
							/>
							{errors.email && (
								<p role="alert" className="text-sm text-red-500">
									{errors.email.message}
								</p>
							)}
						</div>

						<div className="space-y-1">
							<label htmlFor="password" className="text-sm font-medium text-gray-700">
								Password
							</label>
							<Controller
								name="password"
								control={control}
								rules={{ required: "Password is required!" }}
								render={({ field }) => (
									<Input {...field} id="password" type="password" placeholder="••••••••" required />
								)}
							/>
							{errors.password && (
								<p role="alert" className="text-sm text-red-500">
									{errors.password.message}
								</p>
							)}
						</div>

						{/* {error && <p className="text-sm text-red-500 text-center">{error}</p>} */}

						<Button
							type="submit"
							className="w-full bg-[#6d2315] hover:bg-[#591c10]"
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
									Logging in...
								</>
							) : (
								"Login"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
