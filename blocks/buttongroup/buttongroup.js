import {decorateButtons} from "../../scripts/utils.js";

export default function init(el) {
  decorateButtons(el);

  const title = el.querySelector('h1, h2, h3, h4, h5, h6');
  const link = el.querySelector('a');

  if (!title || !link) {
    el.remove();
  }
}
