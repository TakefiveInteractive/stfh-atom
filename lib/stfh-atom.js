'use babel';

import stfhAtomVideoView from './stfh-atom-video-view';
import stfhAtomStatusView from './stfh-atom-status-view';
import { CompositeDisposable } from 'atom';

const Peer = require('peerjs');
const randomWord = require('random-word');

export default {

  stfhAtomVideoView: null,
  stfhAtomStatusView: null,
  stfhAtomStatusViewState: null,
  modalPanel: null,
  statusTile: null,
  subscriptions: null,
  activationState: null,

  peerId: null,

  consumeStatusBar(statusBar) {
    // add status view
    this.stfhAtomStatusView = new stfhAtomStatusView(this.activationState.stfhAtomStatusViewState, this.peerId);
    this.statusTile = statusBar.addRightTile({
      item: this.stfhAtomStatusView.getElement(),
      priority: 1000
    });
  },

  activate(state) {
    this.activationState = state;

    // create peer
    let peerId = [1, 2, 3].map(_ => randomWord()).join('-');
    let peer = new Peer(peerId, { key: 'ob1bohiqjkedn29' });
    this.peerId = peerId;
    console.log('peer', peer);

    // add video view
    this.stfhAtomVideoView = new stfhAtomVideoView(state.stfhAtomVideoViewState, peer);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.stfhAtomVideoView.getElement(),
      visible: false,
      priority: -999
    });
    this.stfhAtomVideoView.didAdd();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'stfh-atom:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.statusTile.destroy();
    this.stfhAtomVideoView.destroy();
    this.stfhAtomStatusView.destroy();
  },

  serialize() {
    return {
      stfhAtomVideoViewState: this.stfhAtomVideoView.serialize(),
      stfhAtomStatusViewState: this.stfhAtomStatusView.serialize()
    };
  },

  toggle() {
    console.log('Video was toggled!');
    return (
      this.modalPanel.isVisible() ?
      (this.modalPanel.hide(), this.stfhAtomVideoView.pauseVideo()) :
      (this.modalPanel.show(), this.stfhAtomVideoView.resumeVideo())
    );
  }

};
