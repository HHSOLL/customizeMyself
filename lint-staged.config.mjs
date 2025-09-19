export default {
  'frontend/**/*.{ts,tsx,js,jsx}': () => 'npm run lint --workspace frontend -- --fix --max-warnings=0',
  'backend/**/*.{ts,tsx,js,jsx}': () => 'npm run lint --workspace backend -- --fix --max-warnings=0',
  '*.{json,md,css,scss,html,yml,yaml}': 'prettier --write',
}
