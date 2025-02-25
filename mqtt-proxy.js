const aedes = require('aedes')()
const ws = require('websocket-stream')
const http = require('http')
const net = require('net')
const mqtt = require('mqtt')

// WebSocket server på port 8081
const httpServer = http.createServer()
ws.createServer({ server: httpServer }, aedes.handle)
httpServer.listen(8081, function () {
  console.log('WebSocket server lytter på port 8081')
})

// Forbind til din MQTT broker
const remoteBroker = mqtt.connect('mqtt://192.168.9.61:1890', {
  username: 'homeassistant',
  password: 'password123'
})

remoteBroker.on('connect', function () {
  console.log('Forbundet til remote MQTT broker')
  
  // Subscribe til alle relevante topics
  remoteBroker.subscribe('tele/+/STATE', function (err) {
    if (!err) {
      console.log('Subscribed til tele/+/STATE på remote broker')
    }
  })
})

// Send beskeder fra remote broker til lokale klienter
remoteBroker.on('message', function (topic, message) {
  console.log('Besked modtaget fra remote broker:', topic)
  aedes.publish({
    topic: topic,
    payload: message
  })
})

// Send beskeder fra lokale klienter til remote broker
aedes.on('publish', function (packet, client) {
  if (client) {
    console.log('Besked modtaget fra lokal klient:', packet.topic)
    remoteBroker.publish(packet.topic, packet.payload)
  }
})
