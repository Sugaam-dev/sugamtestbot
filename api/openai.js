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

    // Create a prompt to ask OpenAI if the user's message matches any FAQ
    const faqPrompt = faqs.map((faq, index) => `${index + 1}. ${faq.question}`).join('\n');
    
    const openAIPrompt = `
      You are a helpful assistant. Below are some common questions (FAQs) asked to a company.
      Your task is to determine if the user's question matches any of these FAQs, even if rephrased. If a match is found, respond with the number of the matching FAQ.
      
      FAQs:
      ${faqPrompt}
      
      User question: "${message}"
    `;

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        prompt: openAIPrompt,
        max_tokens: 10
      })
    });

    const data = await response.json();
    const matchText = data.choices[0]?.text?.trim();
    
    // Check if OpenAI returned a number corresponding to an FAQ
    const faqIndex = parseInt(matchText) - 1;
    if (!isNaN(faqIndex) && faqIndex >= 0 && faqIndex < faqs.length) {
      // Respond with the matching FAQ answer
      return res.status(200).json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: faqs[faqIndex].answer
            }
          }
        ]
      });
    }

    // If no match is found, use OpenAI for a general response
    const generalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const generalData = await generalResponse.json();
    const generalMessage = generalData.choices[0]?.message?.content?.trim();

    // Return OpenAI's general response
    return res.status(200).json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: generalMessage
          }
        }
      ]
    });

  } catch (error) {
    console.error('Error sending message to OpenAI:', error);
    res.status(500).json({ error: 'Error sending message to OpenAI', details: error.message });
  }
};
