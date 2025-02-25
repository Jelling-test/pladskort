# Jelling Familie Camping - Strømmåler Oversigt

Et interaktivt system til at overvåge status på strømmålere på campingpladsen.

## Funktioner
- Vis målere på et kort over pladsen
- Vis status med farver:
  - Grøn = Tændt
  - Gul = Slukket
  - Rød = Offline
- Tilføj nye målere med navn og MAC adresse
- Slet målere ved at højreklikke på dem

## Installation
1. Installer Node.js
2. Kør `npm install` i projektmappen
3. Start proxy serveren med:
   ```
   & "C:\Program Files\nodejs\node.exe" "mqtt-proxy.js"
   ```
4. Åbn `index.html` i en browser

## Konfiguration
MQTT broker indstillinger findes i `mqtt-proxy.js`:
- Host: 192.168.9.61
- Port: 1890
- Brugernavn: homeassistant
