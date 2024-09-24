const fetch = require('node-fetch');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key is not configured' });
    }

    const contactInfo = 'You can contact us for more information at www.sugaam.in, email us at info@sugaam.in, or call +91 - 7722017100.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'system', content: 'Welcome to SUGAAM, where we offer a synergy of efficiency and affordability to optimize your business operations. Our comprehensive services are designed to meet the diverse needs of modern businesses, including IT Consulting, Software Services, AI Services, Process Revamping, Web & App Design, E-Commerce Development, Content Management Systems (CMS), Search Engine Optimization (SEO), UI/UX Design, Mobile Development, MLOps, Machine Learning, and Cloud Migration Assessment. Contact us at www.sugaam.in, email us at info@sugaam.in, or call +91 - 7722017100. Visit us at Ganga Trueno Business Park, Air Force Area, New Airport Rd, Viman Nagar, Pune, Maharashtra 411014.' },
          { role: 'user', content: message }
        ],
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API response was not ok: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if data.choices is valid
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    // Check if the response from OpenAI contains phrases that indicate uncertainty
    const uncertaintyPhrases = [
      "I'm not sure",
      "I don't know",
      "I cannot be certain",
      "I'm unsure",
      "I don't have the information"
    ];

    const assistantMessage = data.choices[0].message.content.toLowerCase();
    const isUncertain = uncertaintyPhrases.some(phrase => assistantMessage.includes(phrase));

    if (isUncertain) {
      return res.status(200).json({ message: contactInfo });
    }

    // If everything is fine, respond with the OpenAI's response
    res.status(200).json(data);
  } catch (error) {
    console.error('Error sending message to OpenAI:', error);
    res.status(500).json({ error: 'Error sending message to OpenAI', details: error.message });
  }
};
