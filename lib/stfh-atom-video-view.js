'use babel';

export default class StfhAtomVideoView {

  constructor(serializedState, peer) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('stfh-atom-video');

    // Add video view
    let video = document.createElement('video');
    video.muted = true;
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

  // called after the view has been added to Atom workspace
  didAdd() {
    let parentPanel = this.getElement().parentNode;
    parentPanel.className += ' videoPanel';

    let parentPanelOnRight = true;
    parentPanel.addEventListener('mouseenter', () => {
      if (parentPanelOnRight) {
        parentPanel.className += ' videoPanel-Hover';
        parentPanelOnRight = false;
      } else {
        parentPanel.className = parentPanel.className.replace(' videoPanel-Hover', '');
        parentPanelOnRight = true;
      }
    });
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
