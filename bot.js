const http = require('http');
const bedrock = require('bedrock-protocol');

const BOT_USERNAME = process.env.BOT_USERNAME || 'JokerBot';
const PORT = Number(process.env.PORT || 10000);

let client = null;
let reconnectTimer = null;
let currentServer = null;

// ==========================================
// HTTP SERVER
// ==========================================

const webServer = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // الصفحة الرئيسية
  if (url.pathname === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    });

    res.end(
      'JokerBot is running.\n' +
      'Use /status to check the bot.\n' +
      'Use /connect?host=SERVER&port=PORT to connect.\n'
    );

    return;
  }

  // حالة البوت
  if (url.pathname === '/status') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });

    res.end(JSON.stringify({
      online: !!client,
      username: BOT_USERNAME,
      server: currentServer
    }, null, 2));

    return;
  }

  // الاتصال بسيرفر Minecraft
  if (url.pathname === '/connect') {
    const host = url.searchParams.get('host');
    const port = Number(url.searchParams.get('port') || 19132);

    if (!host) {
      res.writeHead(400, {
        'Content-Type': 'text/plain; charset=utf-8'
      });

      res.end('Missing host.\nExample: /connect?host=play.example.com&port=19132');
      return;
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      res.writeHead(400, {
        'Content-Type': 'text/plain; charset=utf-8'
      });

      res.end('Invalid port.');
      return;
    }

    try {
      await connectBot(host, port);

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'
      });

      res.end(JSON.stringify({
        success: true,
        message: 'Connection attempt started.',
        server: `${host}:${port}`
      }));

    } catch (error) {
      res.writeHead(500, {
        'Content-Type': 'application/json; charset=utf-8'
      });

      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }

    return;
  }

  res.writeHead(404);
  res.end('Not found.');
});

webServer.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// ==========================================
// CONNECT TO ANY BEDROCK SERVER
// ==========================================

function connectBot(host, port) {
  return new Promise((resolve, reject) => {

    // أغلق الاتصال القديم
    if (client) {
      try {
        client.close();
      } catch (e) {}

      client = null;
    }

    currentServer = {
      host,
      port,
      connected: false
    };

    console.log('================================');
    console.log('Starting JokerBot...');
    console.log(`Server: ${host}:${port}`);
    console.log(`Username: ${BOT_USERNAME}`);
    console.log('================================');

    const newClient = bedrock.createClient({
      host,
      port,
      username: BOT_USERNAME,

      // Microsoft/Xbox authentication
      offline: false,

      profilesFolder: './auth',

      // مهم:
      // لا تستخدم raknet-native
      raknetBackend: 'raknet-node',

      onMsaCode: (data) => {
        console.log('');
        console.log('================================');
        console.log('MICROSOFT LOGIN REQUIRED');
        console.log('================================');
        console.log(`Code: ${data.user_code}`);
        console.log(`URL:  ${data.verification_uri}`);
        console.log('================================');
      },

      followPort: true,
      connectTimeout: 15000
    });

    client = newClient;

    let finished = false;

    client.on('connect', () => {
      console.log('[BOT] Connected.');
    });

    client.on('login', () => {
      console.log('[BOT] Login successful.');
    });

    client.on('join', () => {
      console.log('[BOT] Joined server.');
      currentServer.connected = true;

      if (!finished) {
        finished = true;
        resolve();
      }
    });

    client.on('spawn', () => {
      console.log('[BOT] Spawned successfully.');
      console.log('[BOT] JokerBot is now online.');
    });

    client.on('text', (packet) => {
      if (packet.message) {
        console.log(
          `[CHAT] ${packet.source_name || 'Server'}: ${packet.message}`
        );
      }
    });

    client.on('error', (error) => {
      console.error('[BOT] Error:', error);

      if (!finished) {
        finished = true;
        reject(error);
      }
    });

    client.on('close', (reason) => {
      console.log('[BOT] Connection closed.');
      console.log('[BOT] Reason:', reason);

      if (currentServer) {
        currentServer.connected = false;
      }

      client = null;
    });
  });
}

// ==========================================
// CLEAN SHUTDOWN
// ==========================================

function shutdown() {
  console.log('[SYSTEM] Shutting down...');

  if (client) {
    try {
      client.close();
    } catch (e) {}
  }

  webServer.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
