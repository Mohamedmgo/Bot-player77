const bedrock = require('bedrock-protocol')

const host = process.env.MC_HOST
const port = Number(process.env.MC_PORT || 19132)
const username = process.env.BOT_USERNAME || 'AternosBot'

console.log('Starting Bedrock bot...')
console.log(`Server: ${host}:${port}`)
console.log(`Bot name: ${username}`)

if (!host) {
  console.error('ERROR: MC_HOST is not set.')
  process.exit(1)
}

function connect() {
  console.log('Connecting to Minecraft server...')

  const client = bedrock.createClient({
    host,
    port,
    username,
    skipPing: false
  })

  client.on('join', () => {
    console.log('Bot joined the server!')
  })

  client.on('spawn', () => {
    console.log('Bot spawned in the world!')
  })

  client.on('text', (packet) => {
    console.log(
      `[CHAT] ${packet.source_name || 'Server'}: ${packet.message || ''}`
    )
  })

  client.on('close', (reason) => {
    console.log('Connection closed:', reason)
    console.log('Reconnecting in 10 seconds...')

    setTimeout(connect, 10000)
  })

  client.on('error', (error) => {
    console.error('Bot error:', error)
  })
}

connect()
