# US Shipping Cost Calculator Implementation

## Overview
This implementation follows the exact mathematical formula provided in your images for calculating shipping costs within the United States only.

## Formula
**CTotal = 23.50 + CZone(Destination ZIP)**

### Fixed Inputs
- **Package Billable Weight**: 1.0 lb
- **Carrier Base Cost**: $8.50
- **Fixed Overhead**: $15.00 (Packaging + Handling)
- **Origin ZIP**: 11549 (New York)
- **Base Cost**: $23.50 ($8.50 + $15.00)

### Variable Component
- **CZone**: Changes based on distance from origin ZIP 11549 to destination ZIP code

## Implementation Files

### 1. Core Calculator (`src/lib/shippingCalculator.ts`)
- Implements the exact formula: CTotal = 23.50 + CZone
- Uses the ZIP code database to calculate real distances
- Defines 8 shipping zones based on distance from origin
- Validates US-only shipping

### 2. API Endpoint (`src/app/api/calculate-shipping/route.ts`)
- Updated to use the new mathematical formula
- Simplified to only require destination ZIP and country
- Returns detailed breakdown of costs

### 3. Test Endpoint (`src/app/api/test-shipping-formula/route.ts`)
- Provides comprehensive testing of the formula
- Tests multiple ZIP codes across different zones
- Returns zone information and calculations

### 4. Updated Checkout (`src/components/CheckoutModal.tsx`)
- Simplified to use new API
- Removed old distance calculation logic
- Only supports US shipping as specified

## Shipping Zones

| Zone | Distance Range | Zone Cost | Total Cost |
|------|----------------|-----------|------------|
| Zone 1 (Local) | 0-50 miles | $0.00 | $23.50 |
| Zone 2 (Regional) | 51-150 miles | $2.50 | $26.00 |
| Zone 3 (Regional) | 151-300 miles | $5.00 | $28.50 |
| Zone 4 (Regional) | 301-600 miles | $7.50 | $31.00 |
| Zone 5 (National) | 601-1000 miles | $10.00 | $33.50 |
| Zone 6 (National) | 1001-1400 miles | $12.50 | $36.00 |
| Zone 7 (National) | 1401-1800 miles | $15.00 | $38.50 |
| Zone 8 (Cross-Country) | 1801+ miles | $17.50 | $41.00 |

## Testing

### Test Files Created
1. `test-shipping.js` - Node.js test script
2. `test-shipping.html` - Browser-based test interface

### Test ZIP Codes
- **10001** (NYC) - Zone 1: $23.50
- **19101** (Philadelphia) - Zone 2: $26.00
- **20001** (Washington DC) - Zone 2: $26.00
- **33101** (Miami) - Zone 4: $31.00
- **60601** (Chicago) - Zone 4: $31.00
- **75201** (Dallas) - Zone 5: $33.50
- **80201** (Denver) - Zone 5: $33.50
- **90210** (Los Angeles) - Zone 8: $41.00
- **98101** (Seattle) - Zone 7: $38.50
- **11549** (Origin) - Zone 1: $23.50

## API Usage

### Calculate Shipping Cost
```javascript
POST /api/calculate-shipping
{
  "destinationZip": "90210",
  "destinationCountry": "US"
}
```

### Response
```javascript
{
  "shippingCost": 41.00,
  "baseCost": 23.50,
  "zoneCost": 17.50,
  "distance": 2445.67,
  "zone": "Zone 8 (Cross-Country)",
  "currency": "USD",
  "estimatedDelivery": "3-5 business days",
  "formula": {
    "description": "CTotal = 23.50 + CZone(Destination ZIP)",
    "baseCost": 23.50,
    "zoneCost": 17.50,
    "total": 41.00
  }
}
```

### Test Endpoint
```javascript
GET /api/test-shipping-formula  // Tests multiple ZIP codes
POST /api/test-shipping-formula // Test single ZIP code
{
  "zip": "90210"
}
```

## Key Features

1. **Accurate Distance Calculation**: Uses Haversine formula with real coordinates from ZIP code database
2. **US-Only Shipping**: Validates that shipping is only for United States
3. **Zone-Based Pricing**: 8 zones with increasing costs based on distance
4. **Exact Formula Implementation**: Follows CTotal = 23.50 + CZone exactly
5. **Comprehensive Testing**: Multiple test interfaces and ZIP codes
6. **Error Handling**: Graceful handling of invalid ZIP codes
7. **Detailed Responses**: Returns breakdown of all cost components

## Validation

The implementation ensures:
- Only US ZIP codes are accepted (5-digit or 5+4 format)
- ZIP codes exist in the database
- Distances are calculated accurately using real coordinates
- Zone costs are applied correctly based on distance ranges
- Formula is applied exactly as specified: CTotal = 23.50 + CZone

## Usage in Application

The shipping calculator is integrated into the checkout process and will:
1. Calculate shipping cost when user enters ZIP code
2. Display the cost breakdown
3. Add shipping cost to the total order amount
4. Only allow US addresses for shipping

This implementation provides accurate, consistent shipping calculations based on your exact mathematical formula while maintaining the flexibility to adjust zone costs if needed in the future.