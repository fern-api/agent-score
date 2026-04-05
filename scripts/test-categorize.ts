import { inferCategory } from '../lib/categorize';

const tests = [
  { url: 'https://unknownstartup.xyz', name: 'TechCorp AI' },
  { url: 'https://code.claude.com/docs', name: 'Claude' },
  { url: 'https://docs.somepaymentsco.com', name: 'PayFlow' },
];

async function main() {
  for (const { url, name } of tests) {
    const category = await inferCategory(url, name);
    console.log(`${name} (${url}) → ${category}`);
  }
}

main();
