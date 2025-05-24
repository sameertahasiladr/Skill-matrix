/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./components/**/*.{vue,js}",
		"./layouts/**/*.vue",
		"./pages/**/*.vue",
		"./plugins/**/*.{js,ts}",
		"./nuxt.config.{js,ts}",
	],
	theme: {
		extend: {
			colors: {
				"dodgeroll-gold": "#f79F1A",
				"apple-green": "#046E1B",
				"dire-wolf": "#292727",
				"corn-silk": "#FFF8DC",
				"paris-green": "#5dbea3",
				"mango-yellow": "#ebba6f",
				"correct-guess": "bg-green-500",
				"wrong-guess": "bg-red-500",
				"skipped-word": "bg-yellow-500",
				"pending-guess": "bg-gray-500",
			},
		},
		fontFamily: {
			Montserrat: "Montserrat, sans-serif",
		},
		container: {
			center: true,
			padding: "2rem",
		},
	},
	plugins: [],
};

