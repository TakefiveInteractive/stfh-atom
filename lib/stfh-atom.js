'use babel';

import StfhAtomView from './stfh-atom-view';
import { CompositeDisposable } from 'atom';

export default {

  stfhAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.stfhAtomView = new StfhAtomView(state.stfhAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.stfhAtomView.getElement(),
      visible: false
    });

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
    this.stfhAtomView.destroy();
  },

  serialize() {
    return {
      stfhAtomViewState: this.stfhAtomView.serialize()
    };
  },

  toggle() {
    console.log('StfhAtom was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
