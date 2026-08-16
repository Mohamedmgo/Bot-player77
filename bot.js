const bedrock = require('bedrock-protocol')

// =====================================
// JOKER BOT — SERVER CONFIG
// =====================================

const SERVER = {
  host: 'YOUR_SERVER_ADDRESS',
  port: 19132
}

const BOT_NAME = 'JokerBot'

// =====================================
// BOT
// =====================================

console.log('================================')
console.log('          JOKER BOT')
console.log('================================')
console.log(`Server: ${SERVER.host}:${SERVER.port}`)
console.log(`Bot name: ${BOT_NAME}`)
console.log('Starting...')
console.log('')

function connect() {
  console.log('Connecting to Minecraft Bedrock server...')

  const client = bedrock.createClient({
    host: SERVER.host,
    port: SERVER.port,
    username: BOT_NAME,

    // Microsoft/Xbox authentication
    offline: false,

    // Save authentication data here
    profilesFolder: './auth',

    // Microsoft device-code login
    onMsaCode: (data) => {
      console.log('')
      console.log('================================')
      console.log('     MICROSOFT LOGIN REQUIRED')
      console.log('================================')
      console.log(`Open: ${data.verification_uri}`)
      console.log(`Code: ${data.user_code}`)
      console.log('================================')
      console.log('')
    },

    skipPing: false
  })

  client.on('join', () => {
    console.log('✅ Joker joined the server!')
  })

  client.on('spawn', () => {
    console.log('✅ Joker spawned in the world!')
  })

  client.on('text', (packet) => {
    console.log(
      `[CHAT] ${packet.source_name || 'Server'}: ${packet.message || ''}`
    )
  })

  client.on('close', (reason) => {
    console.log('')
    console.log('❌ Joker disconnected.')
    console.log(`Reason: ${reason || 'Unknown'}`)
    console.log('🔄 Reconnecting in 10 seconds...')

    setTimeout(connect, 10000)
  })

  client.on('error', (error) => {
    console.error('❌ Error:', error.message || error)
  })
}

connect()
