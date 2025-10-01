'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function StripeTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [testHistory, setTestHistory] = useState<Array<{timestamp: string, test: string, result: string}>>([]);

  const addTestToHistory = (test: string, result: string) => {
    setTestHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      test,
      result
    }]);
  };

  const testStripeKeys = async () => {
    setIsLoading(true);
    setTestResult('Testing Stripe configuration...');
    addTestToHistory('Stripe Keys', 'Started');
    
    try {
      // Test 1: Check if publishable key is available
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      }
      
      if (!publishableKey.startsWith('pk_')) {
        throw new Error('Invalid publishable key format (should start with pk_)');
      }
      
      // Check if using live keys
      const isLiveKey = publishableKey.startsWith('pk_live_');
      
      if (isLiveKey) {
        setTestResult('Step 1: ⚠️ WARNING: Using LIVE Stripe keys! Real payments will be processed.');
        addTestToHistory('Publishable Key', '⚠️ LIVE key detected');
      } else {
        setTestResult('Step 1: ✅ Test key detected - safe for development');
        addTestToHistory('Publishable Key', '✅ Test key format');
      }
      
      // Test 2: Try to load Stripe
      setTestResult('Step 2: Loading Stripe...');
      const stripe = await loadStripe(publishableKey);
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      setTestResult('Step 2: ✅ Stripe loaded successfully');
      addTestToHistory('Stripe Loading', '✅ Loaded successfully');
      
      setTestResult('🎉 Stripe configuration is valid!');
      addTestToHistory('Overall', '✅ All Stripe tests passed');
    } catch (error: unknown) {
      console.error('Stripe test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const resultMessage = `❌ Error: ${errorMessage}`;
      setTestResult(resultMessage);
      addTestToHistory('Overall', resultMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testPaymentIntent = async () => {
    setIsLoading(true);
    setTestResult('Testing payment intent creation...');
    addTestToHistory('Payment Intent', 'Started');
    
    // Check if using live keys
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const isLiveKey = publishableKey?.startsWith('pk_live_');
    
    if (isLiveKey) {
      setTestResult('⚠️ WARNING: Using LIVE keys - this will create a REAL payment intent!');
      addTestToHistory('Payment Intent', '⚠️ LIVE environment detected');
    }
    
    try {
      // Test creating a payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: isLiveKey ? 1.00 : 10.00, // Use $1.00 for live, $10.00 for test
          currency: 'usd',
          metadata: {
            test: 'true',
            source: 'debug-panel',
            environment: isLiveKey ? 'live' : 'test'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.clientSecret) {
        throw new Error('No client secret returned');
      }

      setTestResult('✅ Payment intent created successfully!');
      addTestToHistory('Payment Intent', '✅ Created successfully');
      
      // Additional validation
      if (data.clientSecret.startsWith('pi_')) {
        setTestResult('✅ Payment intent format is valid!');
        addTestToHistory('PI Format', '✅ Valid format');
      }

    } catch (error: unknown) {
      console.error('Payment intent test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const resultMessage = `❌ Payment intent error: ${errorMessage}`;
      setTestResult(resultMessage);
      addTestToHistory('Payment Intent', resultMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testFullStripeFlow = async () => {
    setIsLoading(true);
    setTestResult('Testing full Stripe flow...');
    addTestToHistory('Full Flow', 'Started');
    
    try {
      // Step 1: Test keys
      setTestResult('Step 1: Testing Stripe keys...');
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey || !publishableKey.startsWith('pk_')) {
        throw new Error('Invalid or missing publishable key');
      }
      
      // Step 2: Load Stripe
      setTestResult('Step 2: Loading Stripe...');
      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      // Step 3: Create payment intent
      setTestResult('Step 3: Creating payment intent...');
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 25.99,
          currency: 'usd',
          metadata: {
            test: 'true',
            flow: 'full-test'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const { clientSecret } = await response.json();
      
      // Step 4: Validate client secret
      setTestResult('Step 4: Validating client secret...');
      if (!clientSecret || !clientSecret.startsWith('pi_')) {
        throw new Error('Invalid client secret format');
      }

      setTestResult('🎉 Full Stripe flow test passed! Ready for production.');
      addTestToHistory('Full Flow', '✅ All steps completed');
      
    } catch (error: unknown) {
      console.error('Full Stripe flow test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const resultMessage = `❌ Full flow error: ${errorMessage}`;
      setTestResult(resultMessage);
      addTestToHistory('Full Flow', resultMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setTestHistory([]);
  };

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold">Stripe Payment Test</h3>
        {testHistory.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded transition-colors"
          >
            Clear History
          </button>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testStripeKeys}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Stripe Keys'}
        </button>
        
        <button
          onClick={testPaymentIntent}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Payment Intent'}
        </button>
        
        <button
          onClick={testFullStripeFlow}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Full Flow'}
        </button>
      </div>

      {testResult && (
        <div className="bg-[#2A2A2A] p-3 rounded text-sm text-gray-300 whitespace-pre-wrap mb-4">
          {testResult}
        </div>
      )}
      
      {testHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-white font-medium mb-2">Test History</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {testHistory.map((entry, index) => (
              <div key={index} className="text-xs bg-[#2A2A2A] p-2 rounded">
                <div className="flex justify-between">
                  <span className={`font-medium ${
                    entry.result.includes('✅') ? 'text-green-400' : 
                    entry.result.includes('❌') ? 'text-red-400' : 'text-purple-400'
                  }`}>
                    {entry.test}
                  </span>
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-400 truncate">
                  {entry.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Tests Stripe configuration and payment processing</p>
      </div>
    </div>
  );
}