'use babel';

const myStreamUrlId = 'stfh-atom-whatever-shit';

export default class StfhAtomStatusView {

  constructor(serializedState, peerId) {
    // create root element
    this.element = document.createElement('div');
    this.element.classList.add('stfh-atom-status');

    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'status'
    statusDisplay.innerHTML = '<span class="icon icon-device-camera-video" data-name="stfh-atom.less"></span>'
    this.element.appendChild(statusDisplay);

    const audienceDisplay = document.createElement('div');
    audienceDisplay.className = 'watch'
    audienceDisplay.innerHTML = '<span class="icon icon-organization" data-name="stfh-atom.less"> 11</span>'
    this.element.appendChild(audienceDisplay);

    const message = document.createElement('div');
    let url = `http://stfh.rocks/?#/room/${peerId}`;
    message.onclick = () => {
      setClipboardText(url);
      atom.notifications.addSuccess(`Copied: ${url}`);
    }
    message.textContent = `Streaming at ${url}`;
    message.classList.add('message');
    this.element.appendChild(message);

    atom.tooltips.add(message, {title: 'Click to copy the link'});

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

function setClipboardText(text) {
    var id = myStreamUrlId;
    var existsTextarea = document.getElementById(id);

    if(!existsTextarea){
        console.log("Creating textarea");
        var textarea = document.createElement("textarea");
        textarea.id = id;
        // Place in top-left corner of screen regardless of scroll position.
        textarea.style.position = 'fixed';
        textarea.style.top = 0;
        textarea.style.left = 0;

        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textarea.style.width = '1px';
        textarea.style.height = '1px';

        // We don't need padding, reducing the size if it does flash render.
        textarea.style.padding = 0;

        // Clean up any borders.
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.boxShadow = 'none';

        // hide it totally ;)
        textarea.style.opacity = 0;

        // Avoid flash of white box if rendered for any reason.
        textarea.style.background = 'transparent';
        document.querySelector("body").appendChild(textarea);
        console.log("The textarea now exists :)");
        existsTextarea = document.getElementById(id);
    }else{
        console.log("The textarea already exists :3")
    }

    existsTextarea.value = text;
    existsTextarea.select();

    try {
        var status = document.execCommand('copy');
        if (!status) {
            console.error("Cannot copy text");
        } else {
            console.log("The text is now on the clipboard");
        }
    } catch (err) {
        console.log('Unable to copy.');
    }
}
