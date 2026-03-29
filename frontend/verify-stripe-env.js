const requiredServerVars = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"];
const requiredClientVars = ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"];

const missing = [...requiredServerVars, ...requiredClientVars].filter(
  (name) => !process.env[name] || String(process.env[name]).trim().length === 0
);

if (missing.length > 0) {
  console.error("Stripe env validation failed.");
  console.error("Missing variables:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Stripe env validation passed.");
