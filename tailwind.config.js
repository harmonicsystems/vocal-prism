/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TE-inspired warm palette
        cream: {
          50: '#FEFDFB',
          100: '#FBF9F5',
          200: '#F5F3EE',
          300: '#EBE8E0',
          400: '#D9D5C9',
        },
        carbon: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#4A4A4A',
          600: '#333333',
          700: '#262626',
          800: '#1A1A1A',
          900: '#0D0D0D',
        },
        // Accent - warm orange (TE-style)
        signal: {
          orange: '#FF6B35',
          coral: '#FF8F6B',
          amber: '#FFB347',
        },
        // Framework colors - muted, sophisticated
        framework: {
          pythagorean: '#5B8FB9',  // Dusty blue
          vedic: '#D4956A',        // Warm terracotta
          gregorian: '#8B7BB5',    // Muted purple
          western: '#6B9B7A',      // Sage green
          tibetan: '#C47D8C',      // Dusty rose
          neuroscience: '#5BA3A3', // Teal
        },
        // Brainwave colors
        brainwave: {
          delta: '#2D3A4A',
          theta: '#5B4B8A',
          alpha: '#4A7B5B',
          beta: '#B8863B',
          gamma: '#A84A4A',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'hero': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'module': '0.375rem',
      },
      boxShadow: {
        'module': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'module-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
