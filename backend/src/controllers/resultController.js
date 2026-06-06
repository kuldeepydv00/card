const HourlyResult = require('../models/HourlyResult');

const getLatestResults = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const results = await HourlyResult.find({ is_processed: true })
      .sort({ hour_slot: -1 })
      .limit(limit);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getResultBySlot = async (req, res) => {
  try {
    const { hourSlot } = req.params;
    const result = await HourlyResult.findOne({ hour_slot: new Date(hourSlot) });
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getLatestResults, getResultBySlot };
