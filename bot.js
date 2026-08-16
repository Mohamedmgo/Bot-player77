const http = require('http');
const bedrock = require('bedrock-protocol');

// ===============================
// إعدادات السيرفر
// ===============================

const SERVER_HOST = process.env.SERVER_HOST || 'ضع_عنوان_السيرفر_هنا';
const SERVER_PORT = Number(process.env.SERVER_PORT || 19132);

const BOT_USERNAME = process.env.BOT_USERNAME || 'JokerBot';

// ===============================
// سيرفر HTTP صغير لـ Render
// ===============================

const PORT = Number(process.env.PORT || 10000);

const webServer = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });

  res.end('JokerBot is running.\n');
});

webServer.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// ===============================
// تشغيل بوت Minecraft Bedrock
// ===============================

let client;
let reconnectTimer;

function connectBot() {
  console.log('================================');
  console.log('Starting JokerBot...');
  console.log(`Server: ${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`Username: ${BOT_USERNAME}`);
  console.log('================================');

  client = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_USERNAME,

    // Microsoft/Xbox authentication
    offline: false,

    // حفظ جلسة تسجيل الدخول
    profilesFolder: './auth',

    // إظهار كود تسجيل الدخول إذا احتاج Microsoft للمصادقة
    onMsaCode: (data) => {
      console.log('');
      console.log('================================');
      console.log('MICROSOFT LOGIN REQUIRED');
      console.log('================================');
      console.log(`Code: ${data.user_code}`);
      console.log(`URL:  ${data.verification_uri}`);
      console.log('================================');
      console.log('');
    },

    // نحاول مطابقة إصدار السيرفر تلقائيًا
    followPort: true,

    connectTimeout: 15000
  });

  client.on('connect', () => {
    console.log('[BOT] Connected to server.');
  });

  client.on('login', () => {
    console.log('[BOT] Login successful.');
  });

  client.on('join', () => {
    console.log('[BOT] Joined the Minecraft server.');
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

  client.on('close', (reason) => {
    console.log('[BOT] Connection closed.');
    console.log('[BOT] Reason:', reason);

    scheduleReconnect();
  });

  client.on('error', (error) => {
    console.error('[BOT] Error:', error);
  });
}

// ===============================
// إعادة الاتصال تلقائيًا
// ===============================

function scheduleReconnect() {
  if (reconnectTimer) return;

  console.log('[BOT] Reconnecting in 10 seconds...');

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectBot();
  }, 10000);
}

// ===============================
// تشغيل البوت
// ===============================

connectBot();

// ===============================
// إغلاق نظيف
// ===============================

process.on('SIGTERM', () => {
  console.log('[SYSTEM] Shutting down...');

  if (client) {
    try {
      client.close();
    } catch (e) {}
  }

  webServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SYSTEM] Shutting down...');

  if (client) {
    try {
      client.close();
    } catch (e) {}
  }

  webServer.close(() => {
    process.exit(0);
  });
});
