'use babel';

import { createRoom } from './server-interop';
import * as Rx from 'rx';

export function setupMonitoring(roomName) {

  createRoom(roomName)
  .then(({ sendFiles, switchFile, updateCursor, insert, del }) => {

    let textEditorsChanged = Rx.Observable.create(observer => atom.workspace.observeTextEditors(() => observer.onNext(true)));
    let activePanelChanged = Rx.Observable.create(observer => atom.workspace.observeActivePaneItem(() => observer.onNext(true)));

    let activePathChanged = Rx.Observable.combineLatest(textEditorsChanged, activePanelChanged)
    .flatMap(() => {
      let activeEditor = atom.workspace.getActiveTextEditor();
      if (activeEditor) {
        return [activeEditor.getPath()];
      } else {
        return [];
      }
    })
    .distinctUntilChanged();

    activePathChanged
    .subscribe(activePath => {
      // calculate relative path
      let rootPaths = atom.project.getPaths();
      let relPath = activePath;
      for (let i = 0; i < rootPaths.length; i++) {
        if (activePath.startsWith(rootPaths[i])) {
          // kill the absolute part, plus slash
          relPath = activePath.substr(rootPaths[i].length);
          if (relPath[0] === '/') {
            relPath = relPath.substr(1);
          }
          break;
        }
      }
      console.log(relPath);
      switchFile(relPath, 'js');
    });
  });
}
