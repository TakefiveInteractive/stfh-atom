'use babel';

import { File, Point } from 'atom';
import { createRoom } from './server-interop';
import * as Rx from 'rx';
const path = require('path');

export function setupMonitoring(roomName) {

  createRoom(roomName)
  .then(({ sendFiles, switchFile, updateCursor, insert, del, fileRefreshRequest }) => {

    let textEditorsChanged = Rx.Observable.create(observer => atom.workspace.observeTextEditors(() => observer.onNext(true)));
    let activePanelChanged = Rx.Observable.create(observer => atom.workspace.observeActivePaneItem(() => observer.onNext(true)));

    let lastActiveEditor = Rx.Observable.combineLatest(textEditorsChanged, activePanelChanged)
    .flatMap(() => {
      let activeEditor = atom.workspace.getActiveTextEditor();
      if (activeEditor) {
        return [activeEditor];
      } else {
        return [];
      }
    })
    .distinctUntilChanged();

    let activePathChanged = lastActiveEditor
    .map(editor =>
        editor.getPath()
    )
    .distinctUntilChanged();

    let lastDispose = null;
    lastActiveEditor
    .subscribe(editor => {
      if (lastDispose) lastDispose.disposeAction();
      lastDispose = editor.onDidStopChanging(changes => {
        changes.changes.forEach(change => {
          let newExtent = change.newExtent;
          let oldExtent = change.oldExtent;
          let start = change.start;
          let newText = change.newText;
          if (newText === "") { // del
            del([
              editor.getBuffer().characterIndexForPosition(start),
              editor.getBuffer().characterIndexForPosition(
                new Point(start.row + oldExtent.row, start.column + oldExtent.column))
            ]);
          } else { // insert
            insert(editor.getBuffer().characterIndexForPosition(start), newText);
          }
        });
      })
    })

    fileRefreshRequest
    .subscribe(([filePath, ack]) => {
      // read the file and ack with content
      (new File(path.join(rootPath, filePath))).read(false).then(content => ack({content}));
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
