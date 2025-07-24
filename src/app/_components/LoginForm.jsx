"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");

		const supabase = supabaseBrowser();
		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			toast.error(error.message);
		} else {
			router.replace("/dashboard");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
			<Card className="w-full max-w-sm shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-xl">Login</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<Input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<Input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						{error && <p className="text-sm text-red-500 text-center">{error}</p>}
						<Button type="submit" className="w-full">
							Login
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
