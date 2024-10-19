const fetch = require('node-fetch');
const Fuse = require('fuse.js');

// List of FAQs and their answers
const faqs = [
  {
    question: 'When was Sugaam established?',
    answer: 'Sugaam was established in March 2024.'
  },
  {
    question: 'What services does Sugaam offer?',
    answer: 'Sugaam offers IT consulting, software services, AI services, process revamping, web & app design, e-commerce development, content management systems (CMS), search engine optimization (SEO), UI/UX design, mobile development, MLOps, machine learning, and cloud migration assessment.'
  },
  {
    question: 'When was Sugaam started?',
    answer: 'Sugaam was started in March 2024.'
  },
  {
    question: 'Who is the ceo of sugaam ?',question: 'Who is the head of sugaam ?',question: 'Who is the director of sugaam ?',
    answer: 'The Joint Director of sugaam are Pratima Mishra and Rekha Ghosh.'
  }
  // Add more FAQs as needed
];

// Function to find the best matching FAQ using fuzzy logic
function findFaqMatch(message) {
  // Initialize Fuse.js with options
  const options = {
    keys: ['question'],
    threshold: 0.4, // Adjust to control fuzzy matching (lower is stricter, higher is more lenient)
    includeScore: true,
  };

  const fuse = new Fuse(faqs, options);
  const result = fuse.search(message);

  // Return the best match if the score is within a reasonable range
  if (result.length > 0 && result[0].score < 0.4) {
    return result[0].item.answer;
  }
  return null;
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

    // Check if the message matches any FAQ using fuzzy matching
    const faqAnswer = findFaqMatch(message);
    if (faqAnswer) {
      return res.status(200).json({ choices: [{ message: { role: 'assistant', content: faqAnswer } }] });
    }

    // If no FAQ matches, send the message to OpenAI for a dynamic response
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
          { role: 'system', content: 'You are a helpful assistant for Sugaam company. If a question closely matches an FAQ, return the FAQ answer.' },
          { role: 'user', content: message }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();

    // Ensure OpenAI returned a valid response
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Send OpenAI's reply back to the user
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
