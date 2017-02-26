'use babel';

import { File } from 'atom';
import { createRoom } from './server-interop';
import * as Rx from 'rx';
const path = require('path');

export function setupMonitoring(roomName) {

  let rootPath = '';

  createRoom(roomName)
  .then(({ sendFiles, switchFile, updateCursor, insert, del, fileRefreshRequest }) => {

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

    fileRefreshRequest
    .subscribe(([filePath, ack]) => {
      // read the file and ack with content
      console.log('req', filePath, ack);
      let f = path.join(rootPath, filePath);
      console.log(f);
      (new File(f)).read(false).then(content => ack({content}));
    });

    activePathChanged
    .subscribe(activePath => {
      // calculate relative path
      let rootPaths = atom.project.getPaths();
      let relPath = activePath;
      for (let i = 0; i < rootPaths.length; i++) {
        if (activePath.startsWith(rootPaths[i])) {
          // kill the absolute part, plus slash
          relPath = activePath.substr(rootPaths[i].length);
          rootPath = rootPaths[i];
          if (relPath[0] === path.sep) {
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
