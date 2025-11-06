#!/usr/bin/env node

/**
 * Stripe Environment Variables Verification Script
 * Run this to check if your environment variables are properly configured
 */

console.log('🔍 Verifying Stripe Environment Variables...\n');

// Check Node environment
console.log('📊 Environment Info:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Node Version: ${process.version}\n`);

// Check Stripe variables
console.log('🔑 Stripe Configuration:');

const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const secretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Public Key Check
if (!publicKey) {
  console.log('   ❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Missing');
} else if (publicKey === 'pk_test_51234567890abcdef') {
  console.log('   ⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Using placeholder value');
} else if (!publicKey.startsWith('pk_test_') && !publicKey.startsWith('pk_live_')) {
  console.log('   ❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Invalid format');
  console.log(`      Value: ${publicKey.substring(0, 10)}...`);
} else {
  console.log('   ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Valid');
  console.log(`      Type: ${publicKey.startsWith('pk_live_') ? 'Live' : 'Test'}`);
  console.log(`      Prefix: ${publicKey.substring(0, 12)}...`);
}

// Secret Key Check
if (!secretKey) {
  console.log('   ❌ STRIPE_SECRET_KEY: Missing');
} else if (secretKey === 'sk_test_51234567890abcdef') {
  console.log('   ⚠️  STRIPE_SECRET_KEY: Using placeholder value');
} else if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
  console.log('   ❌ STRIPE_SECRET_KEY: Invalid format');
  console.log(`      Value: ${secretKey.substring(0, 10)}...`);
} else {
  console.log('   ✅ STRIPE_SECRET_KEY: Valid');
  console.log(`      Type: ${secretKey.startsWith('sk_live_') ? 'Live' : 'Test'}`);
  console.log(`      Prefix: ${secretKey.substring(0, 12)}...`);
}

// Site URL Check
if (!siteUrl) {
  console.log('   ⚠️  NEXT_PUBLIC_SITE_URL: Missing (will use fallback)');
} else {
  console.log('   ✅ NEXT_PUBLIC_SITE_URL: Set');
  console.log(`      Value: ${siteUrl}`);
}

console.log('\n🎯 Key Matching Check:');
if (publicKey && secretKey) {
  const publicIsLive = publicKey.startsWith('pk_live_');
  const secretIsLive = secretKey.startsWith('sk_live_');
  
  if (publicIsLive === secretIsLive) {
    console.log('   ✅ Key types match');
    console.log(`      Both are ${publicIsLive ? 'LIVE' : 'TEST'} keys`);
  } else {
    console.log('   ❌ Key types mismatch!');
    console.log(`      Public key: ${publicIsLive ? 'LIVE' : 'TEST'}`);
    console.log(`      Secret key: ${secretIsLive ? 'LIVE' : 'TEST'}`);
  }
}

console.log('\n📋 Summary:');
const hasValidPublic = publicKey && publicKey !== 'pk_test_51234567890abcdef' && (publicKey.startsWith('pk_test_') || publicKey.startsWith('pk_live_'));
const hasValidSecret = secretKey && secretKey !== 'sk_test_51234567890abcdef' && (secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_'));

if (hasValidPublic && hasValidSecret) {
  console.log('   ✅ Stripe is properly configured');
  console.log('   🚀 Ready for production deployment');
} else {
  console.log('   ❌ Stripe configuration incomplete');
  console.log('   📝 Add missing environment variables to Vercel');
  console.log('\n💡 Next Steps:');
  console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('   2. Add the missing variables');
  console.log('   3. Redeploy your application');
  console.log('   4. Run this script again to verify');
}

console.log('\n🔗 Helpful Links:');
console.log('   Vercel Env Vars: https://vercel.com/docs/projects/environment-variables');
console.log('   Stripe Dashboard: https://dashboard.stripe.com/apikeys');
console.log('   Fix Guide: ./VERCEL_STRIPE_FIX.md');