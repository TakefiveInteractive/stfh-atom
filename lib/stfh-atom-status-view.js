'use babel';

export default class StfhAtomStatusView {

  constructor(serializedState, peerId) {
    // create root element
    this.element = document.createElement('div');
    this.element.classList.add('stfh-atom');

    const message = document.createElement('div');
    message.textContent = `Streaming at https://stfh.rocks/?${peerId}`;
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
