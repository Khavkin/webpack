import './buttonup.css';

import throttle from 'lodash.throttle';

export default class ButtonUp {
  #button;
  #scrolling = false;
  #scrollPos = 0;
  #container;

  constructor({ container = '' }) {
    document.addEventListener(
      'scroll',
      throttle(this.handlerOnScroll.bind(this), 500)
    );
    // document.addEventListener(
    //   'resize',
    //   throttle(this.handlerOnScroll.bind(this), 500)
    // );

    this.create(container);
  }

  handlerOnScroll(event) {
    const tmpScroll = window.scrollY;
    if (this.#scrollPos < tmpScroll) {
      this.#scrolling = false;
    }
    this.#scrollPos = tmpScroll;

    if (this.#scrolling && window.scrollY === 0) {
      this.#scrolling = false;
      return;
    } else if (this.#scrolling) return;
    if (this.checkCurrentPosition()) this.show();
    else this.hide();
  }

  handlerOnClick() {
    if (!this.#scrolling) {
      this.#scrolling = true;

      this.hide();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  show() {
    // console.log('show', window.scrollY, document.documentElement.clientHeight);
    if (this.#button.classList.contains('button-up--hidden'))
      this.#button.classList.remove('button-up--hidden');
  }

  hide() {
    //  console.log('hide', window.scrollY, document.documentElement.clientHeight);
    if (!this.#button.classList.contains('button-up--hidden'))
      this.#button.classList.add('button-up--hidden');
  }

  create(container = '') {
    this.#button = document.createElement('button');
    const button = this.#button;
    button.type = 'button';
    button.classList.add('button-up');
    button.classList.add('button-up--hidden');
    button.addEventListener('click', this.handlerOnClick.bind(this));

    if (container != '') {
      this.#container = document.querySelector(container);
      //console.log(cont);
      if (this.#container) {
        const rect = this.#container.getBoundingClientRect();
        button.style.left = `${rect.right}px`;
      }
    }

    button.insertAdjacentHTML(
      'beforeend',
      '<svg class="button-up-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 16 16"> <path d="M8 0.5l-7.5 7.5h4.5v8h6v-8h4.5z"></path></svg>'
    );

    document.body.append(button);
    // console.dir(button);
  }

  checkCurrentPosition() {
    if (window.scrollY > document.documentElement.clientHeight) return true;
    else return false;
  }
}
