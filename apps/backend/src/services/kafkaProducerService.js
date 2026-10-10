const axios = require('axios');
const env = require('../config/env');

async function publishImageForAnalysis(imgName, imgBase64) {
  const payload = {
    value: {
      type: 'JSON',
      data: { imgName, imgBase64 },
    },
  };

  const response = await axios.post(env.kafka.producerUrl, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: env.kafka.producerAuth,
    },
  });

  return response.data;
}

module.exports = { publishImageForAnalysis };
