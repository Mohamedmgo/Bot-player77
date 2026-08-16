const bedrock = require('bedrock-protocol')

// ================================
// JOKER BOT - SERVER CONFIG
// ================================

const SERVER = {
  host: 'YOUR_SERVER_ADDRESS',
  port: 19132
}

const BOT_NAME = 'JokerBot'

// ================================
// DO NOT EDIT BELOW THIS LINE
// ================================

console.log('==============================')
console.log('        JOKER BOT')
console.log('==============================')
console.log(`Server: ${SERVER.host}:${SERVER.port}`)
console.log(`Bot: ${BOT_NAME}`)
console.log('Starting...')

function connect() {
  console.log('\nConnecting to server...')

  const client = bedrock.createClient({
    host: SERVER.host,
    port: SERVER.port,
    username: BOT_NAME,

    // Microsoft/Xbox authentication
    offline: false,

    // Automatically use the current supported protocol
    skipPing: false
  })

  client.on('join', () => {
    console.log('✅ Joker Bot joined the server!')
  })

  client.on('spawn', () => {
    console.log('✅ Joker Bot spawned in the world!')
  })

  client.on('text', (packet) => {
    console.log(
      `[CHAT] ${packet.source_name || 'Server'}: ${packet.message || ''}`
    )
  })

  client.on('close', (reason) => {
    console.log(`❌ Disconnected: ${reason || 'Unknown reason'}`)
    console.log('🔄 Reconnecting in 10 seconds...')

    setTimeout(connect, 10000)
  })

  client.on('error', (error) => {
    console.error('❌ Error:', error.message || error)
  })
}

connect()
