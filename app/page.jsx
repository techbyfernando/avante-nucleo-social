import { readFile } from 'node:fs/promises';
import path from 'node:path';
import parse from 'html-react-parser';
import ThemeToggle from '../components/ThemeToggle';

/** Preserve the researched, generated institutional markup while moving the app shell to Next. */
export default async function Page() {
  const html = await readFile(path.join(process.cwd(), 'index.html'), 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (!body) throw new Error('Generated Avante body is missing. Run node scripts/adapt-avante.mjs.');
  return parse(body, {
    replace(node) {
      if (node.name === 'script') return <></>;
      if (node.name === 'button' && node.attribs?.class?.split(/\s+/).includes('theme-toggle')) return <ThemeToggle />;
    },
  });
}
