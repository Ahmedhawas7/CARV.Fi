/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                hud: ['Rajdhani', 'sans-serif'],
            },
            colors: {
                background: '#040406',
                'hxfi-purple': {
                    DEFAULT: '#7C3AED',
                    deep: '#4C1D95',
                    glow: '#A78BFA',
                },
                'hxfi-indigo': '#1E1B4B',
                'hxfi-gold': '#FBBF24',
                'hxfi-green': '#10B981',
            },
            backgroundImage: {
                'hxfi-gradient': 'linear-gradient(135deg, #7C3AED 0%, #1E1B4B 100%)',
                'hxfi-mesh': 'radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(30, 27, 75, 0.1) 0px, transparent 50%)',
            },
            boxShadow: {
                'hxfi-glow': '0 0 20px rgba(124, 58, 237, 0.3)',
                'hxfi-gold-glow': '0 0 15px rgba(251, 191, 36, 0.4)',
            },
            animation: {
                'scanline': 'scanline 8s linear infinite',
            },
            keyframes: {
                'scanline': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' }
                }
            }
        },
    },
    plugins: [],
}
