const express = require('express');
const EventLog = require('../models/EventLog');
const { calculateHash } = require('../utils/hashUtils');

const router = express.Router();

// Log new events
router.post('/log', async (req, res) => {
  const { eventType, timestamp, sourceAppId, dataPayload } = req.body;

  if (!eventType || !timestamp || !sourceAppId || !dataPayload) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const prevLog = await EventLog.findOne().sort({ _id: -1 });
    const prevHash = prevLog ? prevLog.hash : '0';

    const newLog = new EventLog({
      eventType,
      timestamp: new Date(timestamp),
      sourceAppId,
      dataPayload,
      prevHash,
      hash: calculateHash({ eventType, timestamp, sourceAppId, dataPayload, prevHash }),
    });

    await newLog.save();
    res.status(201).json({ message: "Event logged successfully", log: newLog });
  } catch (error) {
    res.status(500).json({ error: "Failed to log event" });
  }
});

// Query event logs with filters and pagination
router.get('/logs', async (req, res) => {
  const { eventType, startTime, endTime, sourceAppId, page = 1, limit = 10 } = req.query;

  const filters = {};
  if (eventType) filters.eventType = eventType;
  if (startTime && endTime) filters.timestamp = { $gte: new Date(startTime), $lte: new Date(endTime) };
  if (sourceAppId) filters.sourceAppId = sourceAppId;

  try {
    const logs = await EventLog.find(filters)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await EventLog.countDocuments(filters);

    res.status(200).json({
      logs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Validate the integrity of the log chain
router.get('/validate-chain', async (req, res) => {
  try {
    const logs = await EventLog.find().sort({ timestamp: 1 });

    for (let i = 1; i < logs.length; i++) {
      const prevLog = logs[i - 1];
      const currentLog = logs[i];

      const recalculatedHash = calculateHash({
        eventType: prevLog.eventType,
        timestamp: prevLog.timestamp,
        sourceAppId: prevLog.sourceAppId,
        dataPayload: prevLog.dataPayload,
        prevHash: prevLog.prevHash,
      });

      if (currentLog.prevHash !== recalculatedHash) {
        return res.status(400).json({
          error: "Chain validation failed",
          invalidLog: currentLog,
        });
      }
    }

    res.status(200).json({ message: "Chain is valid" });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate chain" });
  }
});

module.exports = router;
