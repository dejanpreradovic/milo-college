import { getLibs } from '../../scripts/utils.js';

export default async function init(el) {
  const { createTag, getConfig } = await import(`${getLibs()}/utils/utils.js`);
  const form = createTag('form', { class: 'cheese-form'});
  const label = createTag('label', { for: 'selector' }, 'Favorite cheese');
  const select = createTag('select', { name: 'selector', id: 'selector'});
  const swiss = createTag('option', { value: 'swiss'}, 'Swiss');
  const french = createTag('option', { value: 'french'}, 'French');
  const submit = createTag('button', { class: 'cheese-form-submit'}, 'Send your preference');
  select.append(swiss, french);
  form.append(label, select, submit);
  el.append(form);

  submit.addEventListener('click', async function formSubmit(ev) {
    ev.preventDefault();
    const { contentRoot } = getConfig();
    const send = await fetch(`${contentRoot}/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          'cheese': select.value
        },
      }),
    });
    if ([200, 201].includes(send.status)) {
      el.removeChild(form);
      el.append(createTag('span', {}, 'Thank you'));
      await fetch('https://admin.hlx.page/preview/dejanpreradovic/milo-college/main/drafts/dejan/preferances');
    }
  });
}
