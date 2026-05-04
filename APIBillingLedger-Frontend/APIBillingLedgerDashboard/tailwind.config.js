/** @type {import('tailwindcss').Config} */
export default {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
    extend: {
        colors: {
        // Professional Slate/Blue Palette
        slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            800: '#1e293b',
            900: '#0f172a',
        },
        blue: {
            600: '#2563eb',
            700: '#1d4ed8',
        },
        },
        fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        boxShadow: {
        'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(0,0,0,0.06)',
        },
    },
    container: {
        center: true,
        padding: '1.5rem',
        screens: {
        '2xl': '1280px',
        },
    },
    },
    plugins: [],
}