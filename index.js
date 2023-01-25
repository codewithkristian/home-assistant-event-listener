// import dotenv
require('dotenv').config();

const log = message => console.log(JSON.stringify({ message }))
const rawLog = obj => console.log(JSON.stringify(obj))

// import ws and connect to HOME_ASSISTANT_URL
const WebSocket = require('ws');
const ws = new WebSocket(process.env.HOME_ASSISTANT_URL);

const handleMessage = message => {
  switch (message.type) {
    case 'auth_required':
      ws.send(JSON.stringify({
        type: 'auth',
        access_token: process.env.HOME_ASSISTANT_TOKEN
      }));
      break
    case 'auth_ok':
      ws.send(JSON.stringify({
        id: 1,
        type: 'subscribe_events',
        event_type: '*'
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
  log('connected');
})

// listen for messages
ws.on('message', function message(data) {
  try {
    const message = JSON.parse(data);
    handleMessage(message)
  } catch (error) {
    console.error(JSON.stringify({ error }));
  }
})

// listen for errors
ws.on('error', function error(error) {
  console.error(JSON.stringify({ error }));
})