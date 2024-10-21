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
    question: 'How can I contact Sugaam?',
    answer: 'You can contact Sugaam via email at info@sugaam.in, or call +91-7722017100. Visit us at Ganga Trueno Business Park, Pune, Maharashtra 411014.'
  },
  {
    question: 'Who is the ceo of sugaam?',
    answer: 'The joint director of sugaam is Pratima Mishra and Rekha Ghosh.'
  }
  // Add more FAQs as needed
];

// Function to find the best matching FAQ using fuzzy logic
function findFaqMatch(message) {
  const options = {
    keys: ['question'],
    threshold: 0.4, // Fuzzy match threshold
    includeScore: true,
  };

  const fuse = new Fuse(faqs, options);
  const result = fuse.search(message);

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

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key is not configured' });
    }

    // Define the system message with the assigned role, general knowledge, and instructions
    const systemMessage = {
      role: 'system',
      content: `You are a 20-year-old Customer Service Executive at Sugaam, responsible for providing helpful and professional responses to users. 
      You possess a broad general knowledge and social awareness typical of a 20-year-old. This includes understanding common topics like current technology trends, pop culture, basic academic knowledge, and general social interactions.
      
      Answer questions based on the following FAQs:
      ${faqs.map(faq => faq.question + ": " + faq.answer).join("\n")}.
      
      If you encounter a negative or frustrated user response, remain calm and empathetic. If a question is beyond your knowledge, direct the user to contact Sugaam customer support at info@sugaam.in or +91-7722017100.
      
      If the user message doesn't match an FAQ, generate an appropriate response based on your role, your knowledge as a 20-year-old, and the services offered by Sugaam.`
    };

    // Sending user message and system message to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          systemMessage,
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
