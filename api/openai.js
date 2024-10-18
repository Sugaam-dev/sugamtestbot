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

    // Define the FAQs
    const faqs = [
      { question: 'What services does Sugaam provide?', answer: 'Sugaam offers a variety of IT consulting services, including software development, AI services, process revamping, UI/UX design, mobile app development (Android and iOS), machine learning solutions, cloud migration, cybersecurity, e-commerce development, CMS, SEO, and more.' },
      { question: 'What is the internship program like at Sugaam?', answer: 'Sugaam offers internships in web development, UI/UX design, Android and iOS development, AI software, digital marketing, and game development, designed to nurture talent and exceed industry standards.' },
      { question: 'How can I apply for an internship or job at Sugaam?', answer: 'You can explore internship and job opportunities on the Sugaam website under the Internship or Career pages.' },
      { question: 'What makes Sugaam different from other IT service providers?', answer: 'Sugaam delivers customized IT solutions with a focus on efficiency and affordability for businesses.' },
      { question: 'Where is Sugaam located, and how can I contact them?', answer: 'Sugaam is located at Ganga Trueno Business Park, Air Force Area, Pune, Maharashtra.' },
      { question: 'What industries does Sugaam serve?', answer: 'Sugaam serves various industries by providing IT consulting services.' },
      { question: 'When was Sugaam established?', answer: 'Sugaam was established in March 2024.' }
    ];

    // Check if the user's message matches any FAQ question
    const faqMatch = faqs.find(faq => message.toLowerCase().includes(faq.question.toLowerCase()));
    
    if (faqMatch) {
      // If the user's question matches an FAQ, return the FAQ answer in OpenAI-like format
      return res.status(200).json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: faqMatch.answer
            }
          }
        ]
      });
    }

    // If no FAQ matches, proceed with OpenAI API
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
          { role: 'system', content: 'Welcome to SUGAAM, where we offer a synergy of efficiency and affordability to optimize your business operations.' },
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
