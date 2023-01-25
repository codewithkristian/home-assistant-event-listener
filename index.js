require('dotenv').config();

const WebSocket = require('ws');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'home-assistant-event-listener' },
  transports: [new winston.transports.Console()],
});

const EVENT_TYPE = process.env.EVENT_TYPE || '*';

let hassUrl;
if (!process.env.HOME_ASSISTANT_URL) {
  logger.info('Missing HOME_ASSISTANT_URL environment variable, defaulting to homeassistant.local:8123');
  hassUrl = new URL('ws://homeassistant.local:8123/api/websocket');
} else {
  hassUrl = new URL(`ws://${process.env.HOME_ASSISTANT_URL}/api/websocket`);
}

if (!process.env.HOME_ASSISTANT_TOKEN) {
  logger.error('No HOME_ASSISTANT_TOKEN environment variable set');
  process.exit(1);
}

const ws = new WebSocket(hassUrl);

const handleMessage = (message) => {
  switch (message.type) {
    case 'auth_required':
      logger.info('Authenticating with Home Assistant');
      ws.send(JSON.stringify({
        type: 'auth',
        access_token: process.env.HOME_ASSISTANT_TOKEN,
      }));
      break;
    case 'auth_ok':
      logger.info('Successfully authenticated with Home Assistant');
      logger.info(`Subscribing to events of type ${EVENT_TYPE}`);
      ws.send(JSON.stringify({
        id: 1,
        type: 'subscribe_events',
        event_type: EVENT_TYPE,
      }));
      break;
    case 'result':
      if (message.success) logger.info('Successfully subscribed to events');
      break;
    case 'event':
      logger.info(message);
      break;
    default:
      logger.info(`Unknown message type: ${message.type}`);
      break;
  }
};

// open ws connection
ws.on('open', () => {
  logger.info('Websocket connection opened');
});

// listen for messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    handleMessage(message);
  } catch (error) {
    logger.error(error);
  }
});

// listen for errors
ws.on('error', (error) => {
  logger.error(error);
});
