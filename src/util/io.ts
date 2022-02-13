import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const rlIt = rl[Symbol.asyncIterator]();

export async function readLine() {
  const line = await rlIt.next();
  if (line.done) return null;
  return line.value;
}

export async function question(query: string): Promise<string> {
  return await new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}
