import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		environment: "node",
		alias: {
			"@": resolve(__dirname, "./src"),
		},
		testTimeout: 30000,
		setupFiles: ["./tests/setup.ts"],
	},
});
