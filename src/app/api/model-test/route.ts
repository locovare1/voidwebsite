import { NextResponse } from 'next/server';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/models';

interface GroqModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface GroqModelsResponse {
  data: GroqModel[];
}

export async function GET() {
  try {
    const response = await fetch(GROQ_API_URL, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Models API error: ${response.status} ${response.statusText}`);
    }

    const data: GroqModelsResponse = await response.json();
    
    // Filter for llama3 models
    const llamaModels = data.data.filter((model: GroqModel) => model.id.includes('llama3'));
    
    return NextResponse.json({
      availableModels: data.data.map((model: GroqModel) => model.id),
      llamaModels: llamaModels.map((model: GroqModel) => model.id)
    });
  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: 'Models API test failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}