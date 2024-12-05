/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			animation: {
				"fade-in": "fadeIn 0.3s ease-in-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0", transform: "translateY(1rem)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
};
