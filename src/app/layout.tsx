import { Geist, Geist_Mono, Poppins, Pattaya } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const pattaya = Pattaya({
	variable: "--font-pattaya",
	subsets: ["latin"],
	weight: "400",
});

export const metadata = {
	title: "Cheese Stick Koe",
	description: "Invoice generator for Cheese Stick Koe company",
};

interface RootLayoutProps {
	children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${pattaya.variable} antialiased`}
			>
				<NuqsAdapter>{children}</NuqsAdapter>
				<Toaster position="top-center" richColors />
			</body>
		</html>
	);
}

