export default class History {
  #history;
  #inputElement;
  #historyElement;
  constructor({ inputElement = null, history = [] }) {
    this.#history = history;
    this.#inputElement = inputElement;
    this.onClick = null;

    this.createHistoryElement();
  }

  showHistory() {
    console.log('showHistory');

    // if (!refs.history) {
    //   createHistoryElement();
    // }

    if (this.#historyElement.style.display === 'block') this.hideHistory();
    else this.displayHistory();
  }

  createHistoryElement() {
    //console.log('showHistory create');

    const parentStyle = window.getComputedStyle(this.#inputElement);
    const parentRect = this.#inputElement.getBoundingClientRect();

    console.dir(parentRect);

    this.#historyElement = document.createElement('ul');
    const history = this.#historyElement;
    history.style.width = `${parentRect.width - 2}px`;
    history.style.height = '100px';
    history.style.backgroundColor = parentStyle.backgroundColor;
    history.style.position = 'absolute';
    history.style.top = `${parentRect.bottom + 2}px`;
    history.style.left = `${parentRect.left}px`;
    history.style.overflow = 'auto';
    history.style.cursor = 'pointer';
    history.style.margin = '0';
    history.style.listStyle = 'none';
    history.style.padding = '2px';
    // history.style.borderRadius = parentStyle.borderRadius;

    history.style.display = 'none';

    history.setAttribute('tabindex', '0');
    //console.dir(refs.history.style);

    this.#inputElement.after(history);

    this.#history.forEach(element => {
      this.addLineToHistory(element);
    });

    history.addEventListener('click', this.handlerOnClick.bind(this));
  }

  displayHistory() {
    //console.dir(refs.history);
    // refs.history.style.display = 'block';
    this.#historyElement.style.display = 'block';
    console.dir(this.#historyElement.firstChild);
    this.#historyElement.focus();
  }

  hideHistory() {
    //console.dir(refs.history);
    this.#historyElement.style.display = 'none';
  }

  updateHistory() {}

  addLineToHistory(value) {
    const tmpLi = `<li>${value}</li>`;
    this.#historyElement.insertAdjacentHTML('afterbegin', tmpLi);
  }

  clearHistory() {}

  handlerOnClick(event) {
    if (event.target.nodeName === 'LI') {
      if (this.onClick) {
        //console.dir(event.target);
        this.onClick(event.target.textContent);
      }
      this.hideHistory();
    }
  }
}
