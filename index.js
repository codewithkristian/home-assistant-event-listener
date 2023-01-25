require('dotenv').config();
const WebSocket = require('ws');

const error = error => console.log(JSON.stringify({ error }))
const log = message => console.log(JSON.stringify({ message }))
const rawLog = obj => console.log(JSON.stringify(obj))

let hassUrl

if (!process.env.HOME_ASSISTANT_URL) {
  log('Missing HOME_ASSISTANT_URL environment variable, defaulting to homeassistant.local:8123');
  hassUrl = new URL(`ws://homeassistant.local:8123/api/websocket`)
} else {
  hassUrl = new URL(`ws://${process.env.HOME_ASSISTANT_URL}/api/websocket`)
}

if (!process.env.HOME_ASSISTANT_TOKEN) {
  error("No HOME_ASSISTANT_TOKEN environment variable set")
  process.exit(1)
}

const ws = new WebSocket(hassUrl);

const handleMessage = message => {
  switch (message.type) {
    case 'auth_required':
      log('Authenticating with Home Assistant')
      ws.send(JSON.stringify({
        type: 'auth',
        access_token: process.env.HOME_ASSISTANT_TOKEN
      }));
      break
    case 'auth_ok':
      log('Successfully authenticated with Home Assistant')
      const event_type = process.env.EVENT_TYPE || '*'
      log(`Subscribing to events of type ${event_type}`)
      ws.send(JSON.stringify({
        id: 1,
        type: 'subscribe_events',
        event_type
      }));
      break
    case 'result':
      if (message.success) log('Successfully subscribed to events');
    case 'event':
      rawLog(message)
      break
    default:
      log(`Unknown message type: ${message.type}`);
      break
  }
}

// open ws connection
ws.on('open', function open() {
  log('Websocket connection opened');
})

// listen for messages
ws.on('message', function message(data) {
  try {
    const message = JSON.parse(data);
    handleMessage(message)
  } catch (error) {
    error(error);
  }
})

// listen for errors
ws.on('error', function error(error) {
  error(error);
})