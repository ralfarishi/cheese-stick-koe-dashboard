"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Loader2Icon, LockIcon } from "lucide-react";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const [loading, setLoading] = useState(false);

	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const supabase = supabaseBrowser();
		const { error } = await supabase.auth.signInWithPassword({ email, password });

		setLoading(false);

		if (error) {
			toast.error(error.message);
		} else {
			router.replace("/dashboard");
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
					<form onSubmit={handleLogin} className="space-y-5">
						<div className="space-y-1">
							<label htmlFor="email" className="text-sm font-medium text-gray-700">
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-1">
							<label htmlFor="password" className="text-sm font-medium text-gray-700">
								Password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						{error && <p className="text-sm text-red-500 text-center">{error}</p>}

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
