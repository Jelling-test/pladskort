# Camping Power Monitor

Dette projekt er en web-baseret løsning til at overvåge og visualisere strømforbrug på en campingplads.

## Funktioner

- Real-time overvågning af strømforbrug via MQTT
- Interaktivt pladskort over campingpladsen
- WebSocket integration for live opdateringer
- Responsivt design der virker på alle enheder

## Teknologier

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- MQTT broker: Aedes
- WebSocket kommunikation

## Installation

1. Installer Node.js dependencies:
```bash
npm install
```

2. Start MQTT proxy serveren:
```bash
node mqtt-proxy.js
```

3. Åbn `index.html` i en webbrowser

## Dependencies

- aedes: ^0.50.0
- mqtt: ^5.3.5
- websocket-stream: ^5.5.2

## Struktur

- `index.html` - Hovedsiden med brugergrænsefladen
- `script.js` - Frontend JavaScript kode
- `styles.css` - CSS styling
- `mqtt-proxy.js` - MQTT til WebSocket proxy server
- `map.jpg` - Kort over campingpladsen
- `pladskort/` - Pladskort data og ressourcer
