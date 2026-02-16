#!/usr/bin/env node
/**
 * Script to verify environment variables are set correctly
 * Run this before building: node scripts/verify-env.js
 */

const requiredEnvVars = {
  VITE_API_URL: 'https://cvmate.onrender.com/api',
};

console.log('🔍 Verifying environment variables...\n');

let hasErrors = false;

for (const [key, expectedValue] of Object.entries(requiredEnvVars)) {
  const actualValue = process.env[key];
  
  if (!actualValue) {
    console.error(`❌ ${key} is NOT SET`);
    console.error(`   Expected: ${expectedValue}`);
    hasErrors = true;
  } else if (actualValue.includes('cvmate-kf5p.onrender.com')) {
    console.error(`❌ ${key} is using OLD URL`);
    console.error(`   Current: ${actualValue}`);
    console.error(`   Expected: ${expectedValue}`);
    hasErrors = true;
  } else if (actualValue !== expectedValue) {
    console.warn(`⚠️  ${key} has different value`);
    console.warn(`   Current: ${actualValue}`);
    console.warn(`   Expected: ${expectedValue}`);
  } else {
    console.log(`✅ ${key} is set correctly: ${actualValue}`);
  }
}

console.log('\n');

if (hasErrors) {
  console.error('❌ Environment variables are not configured correctly!');
  console.error('Please update Vercel environment variables:');
  console.error('1. Go to Vercel Dashboard → Project → Settings → Environment Variables');
  console.error('2. Set VITE_API_URL to: https://cvmate.onrender.com/api');
  console.error('3. Redeploy with cache cleared\n');
  process.exit(1);
} else {
  console.log('✅ All environment variables are configured correctly!\n');
  process.exit(0);
}
