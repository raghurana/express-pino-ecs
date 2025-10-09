import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    { files: ['**/*.{ts}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.node } },
    tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-require-imports': 'error',
        },
    },
]);
