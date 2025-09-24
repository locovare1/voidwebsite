# Advanced Debugging System

## Overview

This document describes the enhanced debugging capabilities added to the Void Esports website. The advanced debugging system provides comprehensive testing, monitoring, and diagnostic tools for all major system components.

## Features

### 1. Advanced Debug Page (`/debug`)
- Real-time system status monitoring
- Comprehensive component testing
- Performance metrics tracking
- Detailed error reporting with timestamps
- Test history tracking

### 2. Enhanced Review Service
- Detailed debug logging in development mode
- Performance measurement for all operations
- Improved error handling with specific error codes
- Connection testing capabilities

### 3. Debug Hooks
- Component lifecycle monitoring
- State change tracking
- Performance measurement utilities
- Firebase operation logging

## Usage Instructions

### Accessing the Debug System
1. Navigate to `/debug` in your browser
2. Use the control panel to run individual tests or full system diagnostics
3. Monitor real-time status indicators
4. Review detailed test results and performance metrics

### Running Tests
1. **Network Test**: Verifies internet connectivity and external service availability
2. **Firebase Test**: Tests read/write access to Firestore database
3. **Review Service Test**: Validates the complete review system functionality
4. **All Systems Test**: Runs a comprehensive diagnostic of all components

### Interpreting Results
- ✅ Green results indicate success
- ❌ Red results indicate errors
- ⚠️ Yellow warnings indicate non-critical issues
- Blue results indicate informational messages

## Debugging Components

### AdvancedDebug Component
Located at `src/components/AdvancedDebug.tsx`, this component provides:
- System status monitoring
- Test execution controls
- Performance metrics display
- Detailed test result logging
- Test history tracking

### Debug Hooks
Located at `src/hooks/useDebug.ts`, these hooks provide:
- `useDebug`: Component lifecycle monitoring
- `useDebugState`: State change tracking
- `useFirebaseDebug`: Firebase operation logging

### Enhanced Review Service
Located at `src/lib/reviewService.ts`, enhancements include:
- Detailed debug logging
- Performance measurement
- Enhanced error handling
- Connection testing method

## Troubleshooting Guide

### Common Issues and Solutions

#### Firebase Connection Errors
1. **"Firebase not initialized"**
   - Ensure Firebase config is correct in `src/lib/firebase.ts`
   - Check that environment variables are properly set
   - Verify browser environment (client-side only)

2. **"Permission denied"**
   - Update Firestore security rules to allow read/write access
   - Check Firebase Console for rule configuration

3. **"Unavailable" or timeout errors**
   - Check internet connectivity
   - Verify Firebase service status
   - Check for firewall or network restrictions

#### Review Service Issues
1. **Review submission failures**
   - Check browser console for detailed error messages
   - Verify all required fields are properly filled
   - Test with the debug system to isolate the issue

2. **Empty review lists**
   - Confirm Firebase read permissions
   - Check network connectivity
   - Verify the product ID being queried

### Performance Monitoring
The system tracks:
- Memory usage
- Resource loading times
- API response times
- Component render performance

## Development Best Practices

### Adding New Debug Capabilities
1. Use the `useDebug` hook in components for lifecycle tracking
2. Implement performance measurement for expensive operations
3. Add detailed logging for complex functions
4. Create specific error handling with meaningful messages

### Debug Logging
- All debug logs are only active in development mode
- Use `debugLog` function in the review service for consistent logging
- Include relevant data and context in log messages
- Use appropriate log levels (info, warn, error)

## Future Enhancements

### Planned Features
1. Automated error reporting to external services
2. More detailed performance profiling
3. Integration with browser dev tools
4. Custom rule validation for Firebase security rules
5. Automated test suites for CI/CD pipelines

## Support

For issues not resolved by this debugging system:
1. Check browser console for detailed error messages
2. Review Firebase Console for service outages
3. Verify all environment variables are correctly set
4. Contact the development team with detailed error information