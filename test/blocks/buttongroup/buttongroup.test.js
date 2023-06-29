import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import initButtonGroup from '../../../blocks/buttongroup/buttongroup.js';
import { setLibs } from '../../../scripts/utils.js';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
setLibs('/libs');

describe('The button group', () => {

  it('Should display a title and 5 buttons', async () => {
    const buttonGroup = document.querySelector('#valid');
    await initButtonGroup(buttonGroup);
    const title = buttonGroup.querySelector('h2');
    expect(title).to.exist;
    const buttons = buttonGroup.querySelectorAll('a.con-button');
    expect(buttons.length).to.equal(5);
  });

  it('Should hide block if title or link are missing', async () => {
    const buttonGroup = document.querySelector('#no-title');
    await initButtonGroup(buttonGroup);
    expect(buttonGroup.isConnected).to.false;
  });

});
