/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/*.{html,js,jsx}', './dist/index.html'],  // Adjust based on your project structure
    theme: {
        extend: {},
    },
    safelist: [
        'p-4',
        'bg-blue-500',
        'text-center'  // Add any classes you want to ensure are included
    ],
    plugins: [],
};
