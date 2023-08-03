import { getLibs } from './utils.js';

export default async function init() {
  const { createTag, loadBlock } = await import(`${getLibs()}/utils/utils.js`);

  const academyListener = async () => {
    const academy = createTag('div', { class: 'academy' });
    await loadBlock(academy);
  };

  const sk = document.querySelector('helix-sidekick');
  sk.addEventListener('custom:academy', academyListener);
}
