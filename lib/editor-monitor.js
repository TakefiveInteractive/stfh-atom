'use babel';

import { createRoom } from './server-interop';

export function setupMonitoring(roomName) {
  let activePath = '';

  createRoom(roomName)
  .then(({ sendFiles, switchFile, updateCursor, insert, del }) => {
    atom.workspace.observeTextEditors(() => {
      let activeEditor = atom.workspace.getActiveTextEditor();
      if (activeEditor) {
        let path = activeEditor.getPath();
        if (activePath != path) {
          activePath = path;
          let grammar = activeEditor.getGrammar();
          console.log(grammar);

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
        }
      }
    });
  });
}
