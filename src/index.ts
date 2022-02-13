import { Chat, Message, MessageAck } from 'whatsapp-web.js';
import { bot } from './bot';
import { delay } from './util/delay';
import { question, readLine } from './util/io';

interface Spam {
  chat: Chat;
  content: string;
  times: number;
  timesSent: number;
  lastMsg?: Message;
}

const spams = new Map<string, Spam>();

async function selectChatByIdOrNumber(): Promise<Chat | null> {
  const input = await question(
    'Chat ID oder Nummer (z. B. 4366030573) eingeben: '
  );
  let chat: Chat;
  try {
    chat = await bot.getChatById(input);
  } catch (e) {
    const numberId = await bot.getNumberId(input);
    if (!numberId) {
      console.clear();
      console.log('Der Chat konnte nicht gefunden werden.\n');
      return null;
    }

    chat = await bot.getChatById(numberId._serialized);
  }
  return chat;
}

async function startSpam() {
  const chat = await selectChatByIdOrNumber();
  if (!chat) return;
  if (spams.has(chat.id._serialized)) {
    console.clear();
    return console.log('Dieser Chat wird schon zugespammt.\n');
  }

  const content = await question('\nDeine wunderschöne Nachricht bitte: ');

  const sTimes = await question('\nWie oft soll die verschickt werden: ');
  const times = parseInt(sTimes);
  if (!isFinite(times) || times <= 0) {
    console.clear();
    return console.log('Ungültige Zahl!\n');
  }

  spamLoop({
    chat,
    content,
    times,
    timesSent: 0,
  });

  console.clear();
  console.log(`Spam gestartet!\n`);
}

// Send message by message and wait for acks
async function spamLoop(spam: Spam) {
  spams.set(spam.chat.id._serialized, spam);
  while (spam.timesSent < spam.times) {
    if (!spam.lastMsg || spam.lastMsg.ack >= MessageAck.ACK_SERVER) {
      spam.lastMsg = await bot.sendMessage(
        spam.chat.id._serialized,
        spam.content
      );
      spam.timesSent++;
    }

    await delay(1000);
  }
  spams.delete(spam.chat.id._serialized);
}

// Update read states of last spam messages
bot.on('message_ack', async (msg) => {
  const chat = await msg.getChat();
  const chatId = chat.id._serialized;
  const spam = spams.get(chatId);
  if (spam?.lastMsg?.id._serialized === msg.id._serialized) {
    spam.lastMsg = msg;
  }
});

async function stopSpam() {
  const chat = await selectChatByIdOrNumber();
  if (!chat) return;
  if (!spams.has(chat.id._serialized)) {
    console.clear();
    return console.log('Dieser Chat wird gerade nicht zugespammt.\n');
  }

  spams.delete(chat.id._serialized);

  console.clear();
  console.log('Spam gestoppt!\n');
}

async function logState() {
  const line = readLine();
  let done = false;
  line.then(() => (done = true));

  while (!done) {
    console.clear();

    console.log('Laufende Spams:\n');

    for (const spam of spams.values()) {
      console.log(`Chat id: ${spam.chat.id._serialized}`);
      console.log(`Nachricht: ${spam.content}`);
      console.log(`Nachrichten gesendet: ${spam.timesSent} / ${spam.times}`);
      console.log('');
    }

    console.log('Drücke Enter, um zurückzukehren.');

    await delay(1000);
  }

  console.clear();
}

let logChatIds = false;

bot.on('message_create', async (msg) => {
  if (logChatIds) {
    const chat = await msg.getChat();
    console.log(`${chat.id._serialized} -> ${msg.body.substring(0, 50)}`);
  }
});

async function findChatId() {
  console.log(
    'Schicke jetzt jemandem oder warte auf eine Nachricht, um die zugehörige Chat ID herauszufinden.\n'
  );

  console.log('Drücke Enter, um zurückzukehren.\n');

  logChatIds = true;
  await readLine();
  logChatIds = false;

  console.clear();
}

async function main() {
  while (true) {
    console.log('[0] Verlassen');
    console.log('[1] Spam starten');
    console.log('[2] Spam stoppen');
    console.log('[3] Spam state anzeigen');
    console.log('[4] Chat id herausfinden');

    const input = await question('\nAuswahl: ');
    console.clear();

    if (input === '0') {
      process.exit();
    } else if (input === '1') {
      await startSpam();
    } else if (input === '2') {
      await stopSpam();
    } else if (input === '3') {
      await logState();
    } else if (input === '4') {
      await findChatId();
    } else {
      console.log('Ungültige Auswahl!\n');
    }
  }
}

bot.on('ready', main);
