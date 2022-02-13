import * as qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';

const clientId = 'bot';

export const bot = new Client({
  clientId,
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
  } as any,
  dataPath:
    process.env.NODE_ENV === 'development'
      ? '../whatsapp-bot/WWebJS'
      : './WWebJS',
});

bot.on('change_state', (state) => {
  console.log(`State change: ${state}`);
});

bot.on('qr', (qr) => {
  console.clear();
  console.log(
    'Gehe sicher, dass du die Whatsapp Web Beta aktiviert hast und scan die zwei QR codes mit WhatsApp, um dich einzuloggen:'
  );
  qrcode.generate(qr, { small: true });
});

bot.on('auth_failure', (msg) => {
  console.error(msg);
  console.error('Authentication failed.');
});

bot.on('authenticated', () => {
  console.log('Authenticated.');
});

bot.on('ready', () => {
  console.clear();
  console.log(`Bot ready: ${bot.info.wid._serialized}\n`);
});

bot.on('disconnected', (reason) => {
  console.error(reason);
  console.error('Disconnected.');
});

console.clear();
console.log('Bot wird gestartet...');
bot.initialize();
