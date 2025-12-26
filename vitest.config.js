import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
	test: {
		// Test files location
		include: ["tests/**/*.test.js"],
		// Environment
		environment: "node",
		// Aliases matching jsconfig.json
		alias: {
			"@": resolve(__dirname, "./src"),
		},
		// Global timeout
		testTimeout: 30000,
		// Setup files for mocking
		setupFiles: ["./tests/setup.js"],
	},
});
