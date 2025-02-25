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

## NAS Installation og Konfiguration

For at køre projektet på NAS'en sammen med det eksisterende system, skal følgende ændringer foretages:

### MQTT Broker Konfiguration
I `mqtt-proxy.js` skal MQTT broker indstillingerne tilpasses:
```javascript
const remoteBroker = mqtt.connect('mqtt://192.168.9.61:1890', {
  username: 'homeassistant',
  password: 'password123'
})
```

### Port Konfiguration
WebSocket serveren kører som standard på port 8081. Sørg for at denne port er tilgængelig på NAS'en.

### Permanent Kørsel
For at holde serveren kørende på NAS'en, kan du:
1. Oprette en systemd service, eller
2. Køre den via PM2 process manager
3. Eller bruge Docker (en Dockerfile er inkluderet i projektet)

### Sti Konfiguration
Opdater stien til kortbilleder i `script.js` så de passer med NAS'ens filstruktur.

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
