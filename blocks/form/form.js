import {addInViewAnimationToSingleElement} from '../../tools/utils/helpers.js';

function createSelect(fd) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('select-wrapper');
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  Object.keys(fd).filter(o => o.indexOf('Option-') === 0).forEach((key) => {
    const value = fd[key];
    if (!value) {
      return;
    }
    const option = document.createElement('option');
    option.textContent = value.trim();
    option.value = value.trim();
    select.append(option);
  });
  if (fd.OtherOption) {
    const option = document.createElement('option');
    option.textContent = fd.OtherOption;
    option.value = 'other';
    select.append(option);

    select.addEventListener('change', (e) => {
      if (e.target.value === 'other') {
        const otherFd = {Field: `${select.id}-other-text`, Placeholder: 'Enter your answer', Type: 'text'}
        const other = createInput(otherFd);
        other.classList.add('select-other-input');
        other.setAttribute('data-other', '');
        document.querySelector(`#${select.id}`).insertAdjacentElement("afterend", other);
      } else {
        document.querySelector(`#${select.id}-other-text`).remove();
      }
    })
  }
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  wrapper.append(select);
  return wrapper;
}

function createRadio(fd) {
  const group = document.createElement('div');
  group.classList.add('radio-group');
  Object.keys(fd).filter(o => o.indexOf('Option-') === 0).forEach((key, idx) => {
    const value = fd[key];
    if (!value) {
      return;
    }
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = `${fd.Field}-${idx}`;
    radio.name = fd.Field;
    radio.value = value.trim();
    if (fd.Mandatory === 'x' && idx === 0) {
      radio.setAttribute('required', 'required');
    }
    group.append(radio);

    const label = document.createElement('label');
    label.classList.add('radio-label');
    label.setAttribute('for', `${fd.Field}-${idx}`);
    label.textContent = value.trim();
    group.append(label);

    const br = document.createElement('br');
    group.append(br);
  });
  if (fd.OtherOption) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = `${fd.Field}-other`;
    radio.name = fd.Field;
    radio.value = 'other';
    group.append(radio);

    const other = createInput({Field: `${radio.id}-text`, Placeholder: fd.OtherOption, Type: 'text'});
    other.classList.add('radio-other-input');
    other.setAttribute('data-other', '');
    group.append(other);
  }
  return group;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.type === 'radio') {
      if (payload.hasOwnProperty(fe.name)) {
        return;
      }
      let value = form.querySelector(`input[name='${fe.name}']:checked`)?.value || '';
      if (value === 'other') {
        value = form.querySelector(`#${fe.name}-other-text`)?.value;
      }
      payload[fe.name] = value;
    } else if (fe.type === 'select-one') {
      payload[fe.id] = fe.value;
      if (fe.value === 'other') {
        payload[fe.id] = form.querySelector(`#${fe.id}-other-text`)?.value;
      }
    } else if (fe.id && !fe.hasAttribute('data-other')) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  payload.timestamp = new Date().toJSON();
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('con-button', 'blue', 'button-l', 'button-justified-mobile');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        await submitForm(form);
        if (fd.Extra) {
          window.location.href = fd.Extra;
        }
      }
    });
  }
  return button;
}

function createHeading(fd, el) {
  const heading = document.createElement(el);
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`#${field.fieldId}`).classList.remove('hidden');
        } else {
          console.log(form);
          form.querySelector(`#${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

function applyBranching(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((rule) => {
    const [field, value] = rule.condition?.split('=');
    if (!field || !value) {
      console.warn(`Invalid render condition: ${field}=${value}`);
      return;
    }
    if (payload[field] === value) {
      form.querySelector(`#${rule.fieldId}`).classList.remove('hidden');
    } else {
      form.querySelector(`#${rule.fieldId}`).classList.add('hidden');
    }
  });
}

function fill(form) {
  const { action } = form.dataset;
  if (action === '/tools/bot/register-form') {
    const loc = new URL(window.location.href);
    form.querySelector('#owner').value = loc.searchParams.get('owner') || '';
    form.querySelector('#installationId').value = loc.searchParams.get('id') || '';
  }
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  const branching = [];
  // todo - need to change this
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  // todo - used local testing, need to figure out how to assign this value dynamically
  form.dataset.action = 'https://main--milo-college--dejanpreradovic.hlx.page/drafts/dejan/form-incoming'
  json.data.forEach((fd, idx) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.id = `${fieldId}-${idx}`;
    fieldWrapper.classList.add('field-wrapper');
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'radio':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createRadio(fd));
        break;
      case 'heading':
        fieldWrapper.append(createHeading(fd, 'h3'));
        break;
      case 'legal':
        fieldWrapper.append(createHeading(fd, 'p'));
        break;
      case 'checkbox':
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case 'text-area':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId: fieldWrapper.id, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    if (fd.RenderCondition) {
      branching.push({fieldId: fieldWrapper.id, condition: fd.RenderCondition});
    }
    form.append(fieldWrapper);
  });

  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);
  form.addEventListener('change', () => applyBranching(form, branching));
  applyBranching(form, branching);
  fill(form);
  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  addInViewAnimationToSingleElement(block, 'fade-up');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
