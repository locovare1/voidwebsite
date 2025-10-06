// Test shipping calculation
const isInternational = true;
const baseRate = isInternational ? 25.00 : 5.00;
const weightFactor = 5 * (isInternational ? 3.0 : 1.0);
const distanceFactor = 0.5;
const totalCost = baseRate + weightFactor + distanceFactor;
const minCost = isInternational ? 15.00 : 5.00;
const finalCost = Math.max(minCost, totalCost);
console.log('Final shipping cost for Saudi Arabia:', finalCost);