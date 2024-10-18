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

    // Directly send the message to OpenAI to get a response
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

    // Ensure OpenAI returned a valid response
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
