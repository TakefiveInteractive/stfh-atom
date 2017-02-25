'use babel';

const Peer = require('peerjs');
const randomWord = require('random-word');

export default class StfhAtomView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('stfh-atom');

    // Create message element
    /*const message = document.createElement('div');
    message.textContent = 'The StfhAtom package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);*/

    let peerId = [1, 2, 3].map(_ => randomWord()).join('-');
    let peer = new Peer(peerId, { key: 'ob1bohiqjkedn29' });
    console.log('peer', peer);

    const message = document.createElement('div');
    message.textContent = `Streaming at https://stfh.rocks/?${peerId}`;
    message.classList.add('message');
    this.element.appendChild(message);

    // Add video view
    let video = document.createElement('video');
    this.video = video;
    this.element.appendChild(video);

    // Initialize video streaming
    let getSources = () => new Promise(MediaStreamTrack.getSources)
    .then(sources => {
      console.log(sources);
      return sources.filter(source => source.kind === 'video');
    });

    let getMedia = videoSources => new Promise((resolve, reject) =>
      navigator.webkitGetUserMedia({
        audio: true,
        video: {
          optional: [ { sourceId: videoSources[0] } ]
        }
    }, resolve, reject));

    getSources()
    .then(getMedia)
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = e => video.play();
      this.stream = stream;
      return stream;
    })
    .then(stream => {
      // set up streaming listener
      peer.on('connection', conn => {
        console.log('on connection');
        let call = peer.call(conn.peer, stream);
        call.on('stream', stream => console.log('on call stream', stream));
      });
    })
    .catch(err => atom.notifications.addWarning(err));
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    this.stream.getTracks().forEach(track => track.stop());
  }

  getElement() {
    return this.element;
  }

  pauseVideo() {
    console.log('Pause Video');
    this.video.pause();
  }

  resumeVideo() {
    console.log('Resume Video');
    this.video.play();
  }

}
