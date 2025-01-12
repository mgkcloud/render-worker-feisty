#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  '.env',
  'src/main.tsx',
  'src/compositions/TikTok.tsx',
  'src/compositions/CaptionPage.tsx',
  'src/services/videoService.ts',
  'src/env.d.ts',
  'src/test-data.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html'
];

const requiredDependencies = [
  '@remotion/player',
  '@remotion/cli',
  '@vitejs/plugin-react',
  'react',
  'react-dom',
  'tailwindcss'
];

console.log('Checking project setup...\n');

// Check files
console.log('Checking required files:');
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));

if (missingFiles.length > 0) {
  console.log('\n❌ Missing files:');
  missingFiles.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('✅ All required files present');
}

// Check package.json
console.log('\nChecking dependencies:');
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
const missingDeps = requiredDependencies.filter(dep => !installedDeps[dep]);

if (missingDeps.length > 0) {
  console.log('\n❌ Missing dependencies:');
  missingDeps.forEach(dep => console.log(`  - ${dep}`));
} else {
  console.log('✅ All required dependencies installed');
}

// Check environment variables
console.log('\nChecking environment variables:');
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const requiredEnvVars = ['VITE_API_KEY', 'VITE_API_BASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !envContent.includes(envVar));

if (missingEnvVars.length > 0) {
  console.log('\n❌ Missing environment variables:');
  missingEnvVars.forEach(envVar => console.log(`  - ${envVar}`));
} else {
  console.log('✅ All required environment variables present');
}

// Summary
console.log('\nSetup check complete!');
if (missingFiles.length === 0 && missingDeps.length === 0 && missingEnvVars.length === 0) {
  console.log('✅ Project is properly configured');
} else {
  console.log('❌ Please fix the issues above to ensure proper functionality');
}
