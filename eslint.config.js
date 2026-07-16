import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const typed = tseslint.configs.recommendedTypeChecked.map((config) => ({ ...config, files: ['src/**/*.{ts,tsx}', '*.{ts,tsx}'] }));
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'docs/audit/*.json'] },
  { ...js.configs.recommended, files: ['*.js'], languageOptions: { globals: globals.node } },
  ...typed,
  {
    files: ['src/**/*.{ts,tsx}', '*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node }, parserOptions: { project: ['./tsconfig.app.json', './tsconfig.node.json'], tsconfigRootDir: import.meta.dirname } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
);
