const axios = require('axios');

const simulateEvents = async () => {
  const events = ['USER_LOGIN', 'FILE_UPLOAD', 'DATA_EXPORT', 'ERROR'];
  const sourceApps = ['app1', 'app2', 'app3'];

  for (let i = 0; i < 10; i++) {
    const event = {
      eventType: events[Math.floor(Math.random() * events.length)],
      timestamp: new Date().toISOString(),
      sourceAppId: sourceApps[Math.floor(Math.random() * sourceApps.length)],
      dataPayload: { message: `Event number ${i}` },
    };

    try {
      const response = await axios.post('http://localhost:9000/api/events/log', event);
      console.log("Event Logged:", response.data.log);
    } catch (error) {
      console.error("Failed to log event:", error.message);
    }
  }
};

simulateEvents();
