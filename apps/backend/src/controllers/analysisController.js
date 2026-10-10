const mongoService = require('../services/mongoService');
const kafkaProducerService = require('../services/kafkaProducerService');

async function getImageAnalysis(req, res, next) {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: '"name" query parameter is required' });
    }

    const result = await mongoService.findImageAnalysisByName(name);
    if (!result) {
      return res.status(404).json({ error: `No analysis found for image "${name}"` });
    }

    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function submitImageForAnalysis(req, res, next) {
  try {
    const { imgName, imgBase64 } = req.body;
    if (!imgName || !imgBase64) {
      return res.status(400).json({ error: '"imgName" and "imgBase64" are required' });
    }

    const result = await kafkaProducerService.publishImageForAnalysis(imgName, imgBase64);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getImageAnalysis, submitImageForAnalysis };
