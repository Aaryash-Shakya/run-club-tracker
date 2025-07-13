import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		files: ["**/*.{js,ts}"],
		languageOptions: {
			parser: typescriptParser,
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node,
			},
		},
		plugins: {
			"@typescript-eslint": typescript,
			prettier: prettier,
		},
		rules: {
			...typescript.configs.recommended.rules,
			...prettierConfig.rules,
			"prettier/prettier": "error",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
			"prefer-const": "error",
			"no-var": "error",
			"max-lines": ["warn", { max: 1000, skipBlankLines: true, skipComments: true }],
		},
	},
	{
		ignores: ["node_modules/**", "dist/**", "*.log", ".env"],
	},
];
