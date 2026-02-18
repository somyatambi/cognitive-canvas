// Example TypeScript API Client for Brainstormer Agent
// Place this in your frontend/src directory

interface BrainstormerRequest {
  prompt: string;
  mode?: 'keyword' | 'expand' | 'merge' | 'analyze' | 'score' | 'refine';
  persona?: 'student' | 'entrepreneur' | 'hackathon';
  secondary_input?: string; // For merge mode
}

/**
 * Call the Brainstormer Agent API with streaming response
 * @param request - The brainstormer request configuration
 * @param onChunk - Callback function to handle each streamed chunk
 * @param onComplete - Callback function when streaming completes
 * @param onError - Callback function to handle errors
 */
export async function callBrainstormerAgent(
  request: BrainstormerRequest,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const BRAINSTORMER_URL = 'http://localhost:8001'; // Adjust port as needed

  try {
    const response = await fetch(`${BRAINSTORMER_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        mode: request.mode || 'keyword',
        persona: request.persona || 'hackathon',
        secondary_input: request.secondary_input || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Error calling brainstormer agent:', error);
    onError?.(error as Error);
  }
}

// Example Usage in a React Component:
/*
import { useState } from 'react';
import { callBrainstormerAgent } from './brainstormerApi';

function BrainstormerExample() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const generateKeywordIdeas = async () => {
    setLoading(true);
    setResponse('');

    await callBrainstormerAgent(
      {
        prompt: 'AI',
        mode: 'keyword',
        persona: 'hackathon'
      },
      (chunk) => {
        // Append each chunk to the response
        setResponse((prev) => prev + chunk);
      },
      () => {
        // On complete
        setLoading(false);
        console.log('Generation complete!');
      },
      (error) => {
        // On error
        setLoading(false);
        console.error('Error:', error);
      }
    );
  };

  const mergeIdeas = async () => {
    setLoading(true);
    setResponse('');

    await callBrainstormerAgent(
      {
        prompt: 'AI fitness coach',
        mode: 'merge',
        persona: 'entrepreneur',
        secondary_input: 'Gamified habit tracker'
      },
      (chunk) => setResponse((prev) => prev + chunk),
      () => setLoading(false),
      (error) => {
        setLoading(false);
        console.error('Error:', error);
      }
    );
  };

  const refineIdea = async () => {
    setLoading(true);
    setResponse('');

    await callBrainstormerAgent(
      {
        prompt: 'something with blockchain and gaming',
        mode: 'refine',
        persona: 'student'
      },
      (chunk) => setResponse((prev) => prev + chunk),
      () => setLoading(false),
      (error) => {
        setLoading(false);
        console.error('Error:', error);
      }
    );
  };

  return (
    <div>
      <h2>Brainstormer Agent</h2>
      <button onClick={generateKeywordIdeas} disabled={loading}>
        Generate Keyword Ideas
      </button>
      <button onClick={mergeIdeas} disabled={loading}>
        Merge Ideas
      </button>
      <button onClick={refineIdea} disabled={loading}>
        Refine Idea
      </button>
      
      <div>
        <h3>Response:</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{response}</pre>
      </div>
    </div>
  );
}

export default BrainstormerExample;
*/

// Quick Mode Examples:

// 1. KEYWORD MODE - Generate ideas from a keyword
export const exampleKeywordMode = {
  prompt: 'sustainability',
  mode: 'keyword' as const,
  persona: 'entrepreneur' as const,
};

// 2. EXPAND MODE - Branch out from an existing idea
export const exampleExpandMode = {
  prompt: 'AI-powered resume builder for students',
  mode: 'expand' as const,
  persona: 'student' as const,
};

// 3. MERGE MODE - Combine two ideas
export const exampleMergeMode = {
  prompt: 'AI chatbot for customer support',
  mode: 'merge' as const,
  persona: 'entrepreneur' as const,
  secondary_input: 'Blockchain loyalty rewards platform',
};

// 4. ANALYZE MODE - Market analysis
export const exampleAnalyzeMode = {
  prompt: 'AI-powered code review tool for development teams',
  mode: 'analyze' as const,
  persona: 'entrepreneur' as const,
};

// 5. SCORE MODE - Evaluate and rank ideas (separate with |)
export const exampleScoreMode = {
  prompt: 'Notion template marketplace | AI essay grading tool | Campus event finder app',
  mode: 'score' as const,
  persona: 'student' as const,
};

// 6. REFINE MODE - Polish a rough idea
export const exampleRefineMode = {
  prompt: 'like an app where people can share their ideas and get feedback maybe with ai or something',
  mode: 'refine' as const,
  persona: 'hackathon' as const,
};
