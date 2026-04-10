
// ===============================
// CONFIGURACIÓN DE ESLINT
// ===============================
// Este archivo define las reglas de linting para el frontend React.
// Incluye soporte para hooks, React Refresh y globales de navegador.
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Exporta la configuración principal de ESLint
export default defineConfig([
  globalIgnores(['dist']), // Ignora la carpeta de build
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,              // Reglas recomendadas para JS
      reactHooks.configs.flat.recommended, // Buenas prácticas para hooks
      reactRefresh.configs.vite,           // Soporte para Vite + React Refresh
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,            // Variables globales de navegador
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Permite variables globales en mayúsculas
    },
  },
])
