const fetch = require('node-fetch');

// Predefined FAQs and their embeddings
const faqs = [
  {
    question: 'When was Sugaam established?',
    answer: 'Sugaam was established in March 2024.',
    embedding: [] // Will store vector embeddings
  },
  {
    question: 'What services does Sugaam offer?',
    answer: 'Sugaam offers IT consulting, software services, AI services, ...',
    embedding: []
  }
  // Add more FAQs here
];

// Function to generate embedding for a given text
async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text
    })
  });
  
  const data = await response.json();
  return data.data[0].embedding;
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to find closest matching FAQ based on embedding similarity
async function findClosestFAQ(userMessage) {
  const userEmbedding = await generateEmbedding(userMessage);

  let bestMatch = null;
  let highestSimilarity = 0.7; // Set a threshold for matching

  for (const faq of faqs) {
    const similarity = cosineSimilarity(userEmbedding, faq.embedding);
    if (similarity > highestSimilarity) {
      bestMatch = faq;
      highestSimilarity = similarity;
    }
  }

  return bestMatch ? bestMatch.answer : null;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Find a close match for the user query in the FAQ list
    const faqAnswer = await findClosestFAQ(message);
    if (faqAnswer) {
      return res.status(200).json({ choices: [{ message: { role: 'assistant', content: faqAnswer } }] });
    }

    // If no FAQ match is found, send the message to OpenAI for a dynamic response
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key is not configured' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for Sugaam company.' },
          { role: 'user', content: message }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Send the OpenAI's reply back to the user
    res.status(200).json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: data.choices[0].message.content
          }
        }
      ]
    });

  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).json({ error: 'Error communicating with OpenAI', details: error.message });
  }
};
