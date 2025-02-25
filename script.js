class PowerMeterMap {
    constructor() {
        this.canvas = document.getElementById('mapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'map.jpg';  // Kort billedet skal gemmes som map.jpg
        this.meters = [];
        this.addingMeter = false;
        this.tempMeterName = '';

        // MQTT setup
        this.mqttClient = null;
        this.setupMQTT();

        // Event listeners
        this.setupEventListeners();

        // Load existing meters from localStorage
        this.loadMeters();

        // Initial render when image loads
        this.backgroundImage.onload = () => {
            this.resizeCanvas();
            this.render();
        };
    }

    setupMQTT() {
        console.log('Forsøger at forbinde til lokal MQTT proxy');
        
        const brokerUrl = 'ws://localhost:8081';
        console.log('Forbinder til:', brokerUrl);
        
        this.mqttClient = mqtt.connect(brokerUrl);

        this.mqttClient.on('connect', () => {
            console.log('Forbundet til MQTT proxy');
            // Subscribe til alle STATE beskeder
            this.mqttClient.subscribe('tele/+/STATE', (err) => {
                if (err) {
                    console.error('Fejl ved subscribe:', err);
                } else {
                    console.log('Subscribed til tele/+/STATE');
                }
            });
        });

        this.mqttClient.on('error', (error) => {
            console.error('MQTT fejl:', error.message);
        });

        this.mqttClient.on('message', (topic, message) => {
            console.log('MQTT besked modtaget:');
            console.log('Topic:', topic);
            console.log('Payload:', message.toString());
            
            try {
                const data = JSON.parse(message.toString());
                const parts = topic.split('/');
                const macAddress = parts[1];
                
                console.log('Søger efter måler med MAC:', macAddress);
                console.log('Nuværende målere:', this.meters);
                
                if (data.POWER !== undefined) {
                    // Find måleren uanset store/små bogstaver
                    const meter = this.meters.find(m => m.id.toLowerCase() === macAddress.toLowerCase());
                    if (meter) {
                        console.log('Fandt måler:', meter.name, 'Opdaterer status til:', data.POWER);
                        meter.status = data.POWER === "ON" ? "on" : "off";
                        meter.lastUpdate = new Date();
                        this.render();
                    } else {
                        console.log('Ingen måler fundet med MAC:', macAddress);
                    }
                }
            } catch (error) {
                console.error('Fejl ved parsing af MQTT besked:', error);
            }
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.getElementById('addMeterBtn').addEventListener('click', () => {
            this.startAddingMeter();
        });

        document.getElementById('cancelAdd').addEventListener('click', () => {
            this.cancelAddingMeter();
        });

        this.canvas.addEventListener('click', (event) => {
            if (this.addingMeter) {
                this.handleMapClick(event);
            }
        });

        // Tilføj højreklik håndtering
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Undgå standard kontekstmenu
            
            const rect = this.canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / this.canvas.width;
            const y = (event.clientY - rect.top) / this.canvas.height;
            
            // Find måler tæt på klikket
            const clickRadius = 0.05; // 5% af canvas størrelse
            const clickedMeter = this.meters.find(meter => {
                const distance = Math.sqrt(
                    Math.pow(meter.x - x, 2) + 
                    Math.pow(meter.y - y, 2)
                );
                return distance < clickRadius;
            });
            
            if (clickedMeter) {
                if (confirm(`Vil du slette måler ${clickedMeter.name}?`)) {
                    this.meters = this.meters.filter(m => m !== clickedMeter);
                    this.saveMeters();
                    this.render();
                }
            }
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const ratio = this.backgroundImage.height / this.backgroundImage.width;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientWidth * ratio;
        this.render();
    }

    startAddingMeter() {
        const dialog = document.getElementById('addMeterDialog');
        const nameInput = document.getElementById('meterName');
        dialog.classList.remove('hidden');
        nameInput.focus();
        this.addingMeter = true;
    }

    cancelAddingMeter() {
        const dialog = document.getElementById('addMeterDialog');
        dialog.classList.add('hidden');
        this.addingMeter = false;
        document.getElementById('meterName').value = '';
        document.getElementById('macAddress').value = '';
    }

    handleMapClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.canvas.width;
        const y = (event.clientY - rect.top) / this.canvas.height;
        
        const name = document.getElementById('meterName').value.trim();
        const macAddress = document.getElementById('macAddress').value.trim();

        if (!name) {
            alert('Indtast venligst et navn til måleren (3 cifre)');
            return;
        }
        if (!macAddress) {
            alert('Indtast venligst MAC adressen på måleren');
            return;
        }
        if (!/^\d{3}$/.test(name)) {
            alert('Måler navnet skal være præcis 3 cifre');
            return;
        }
        if (!/^obk[0-9A-Fa-f]+$/.test(macAddress)) {
            alert('MAC adressen skal starte med "obk" efterfulgt af tal/bogstaver');
            return;
        }

        this.addMeter(name, macAddress, x, y);
        this.cancelAddingMeter();
    }

    addMeter(name, macAddress, x, y) {
        const meter = {
            id: macAddress,  // Bruger MAC adressen som ID
            name: name,      // Det korte navn (3 cifre)
            x: x,
            y: y,
            status: 'offline'
        };

        this.meters.push(meter);
        this.saveMeters();
        this.render();
    }

    updateMeterStatus(meterId, status) {
        const meter = this.meters.find(m => m.id === meterId);
        if (meter) {
            meter.status = status;
            meter.lastUpdate = new Date();
            this.render();
        }
    }

    loadMeters() {
        const saved = localStorage.getItem('powerMeters');
        if (saved) {
            this.meters = JSON.parse(saved);
        }
    }

    saveMeters() {
        localStorage.setItem('powerMeters', JSON.stringify(this.meters));
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Tegn baggrundsbilledet
        if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Tegn alle målere
        this.meters.forEach(meter => {
            const x = meter.x * this.canvas.width;
            const y = meter.y * this.canvas.height;
            
            // Vælg farve baseret på status
            let color;
            switch (meter.status) {
                case 'on':
                    color = '#00FF00'; // Grøn
                    break;
                case 'off':
                    color = '#FFFF00'; // Gul
                    break;
                default:
                    color = '#FF0000'; // Rød (offline)
            }
            
            // Tegn navnet med den valgte farve
            this.ctx.font = 'bold 7px Arial';
            this.ctx.fillStyle = color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(meter.name, x, y);
        });
    }
}

// Start applikationen når siden er loaded
document.addEventListener('DOMContentLoaded', () => {
    const powerMap = new PowerMeterMap();
});
