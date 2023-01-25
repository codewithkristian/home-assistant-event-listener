# home-assistant-event-listener

This is a simple event listener for Home Assistant. It connects to the Home Assistant websocket API and listens for events. When an event is received, it will output it as JSON.

## Configuration

The following environment variables are supported:
- `EVENT_TYPE` - The type of event to listen for. Defaults to `*`.
- `HOME_ASSISTANT_TOKEN` - A generated [Home Assistant long-lived access token](https://developers.home-assistant.io/docs/auth_api/#making-authenticated-requests). **This is required.**
- `HOME_ASSISTANT_URL` - The URL of the Home Assistant instance to connect to. Should be in the format `host:port`. Defaults to `homeassistant.local:8123`.

## Usage

```bash
$ cp .env.example .env # Fill out your .env details
$ npm start
```

The output of the application is JSON. You can pipe it to a file or another application:

```bash
$ npm start > log
$ npm start | jq .
```