export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { answers } = await req.json();

  const prompt = `You are helping a parent who is breaking generational cycles write a heartfelt letter to their children.

Using ONLY the personal details they shared below, write a warm, honest, and powerful "Letter to My Kids" in their voice — first person, spoken directly to their children.

Do NOT be generic or preachy. Use their actual words and experiences. Make it feel real, not like a template. 3-4 paragraphs. No fluff. Start with "To my kids,"

How they're doing right now: "${answers.current}"
What they inherited growing up: "${answers.inherited}"
Their turning point moment: "${answers.turning}"
Who they're becoming: "${answers.becoming}"
What they want their kids to know: "${answers.forKids}"`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const letter = data.content?.[0]?.text || 'Something went wrong. Please try again.';

  return new Response(JSON.stringify({ letter }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
