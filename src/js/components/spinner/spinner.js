import './spinner.css';
const spinnerMarkup =
  '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';

export default class Spinner {
  #spinner;
  constructor() {
    this.#spinner = document.createElement('div');
    this.#spinner.classList.add('spinner-wrap');
    this.#spinner.classList.add('spinner-invisible');
    this.#spinner.insertAdjacentHTML('afterbegin', spinnerMarkup);
    document.body.append(this.#spinner);
  }

  showSpinner() {
    this.#spinner.classList.remove('spinner-invisible');
  }

  hideSpinner() {
    this.#spinner.classList.add('spinner-invisible');
  }
}

// export default function showSpinner() {
//   const el = document.createElement('div');
//   el.classList.add('spinner-wrap');

//   el.insertAdjacentHTML('afterbegin', spinnerMarkup);
//   document.body.append(el);
// }
