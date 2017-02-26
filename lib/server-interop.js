'use babel';

import io from 'socket.io-client';
import * as Rx from 'rx';

const socket = io('http://stfh.rocks');
let isConnected = false;

let connectPromise = new Promise((resolve, reject) => {
  socket.on('connect', () => {
    isConnected = true;
    resolve();
  });
});

socket.on('disconnect', () => {
  isConnected = false;
});

let ensureConnect = () => connectPromise.then(() => {
  if (isConnected) {
    return 'connected';
  } else {
    throw new Error('Disconnected');
  }
});

// promisify socket.io req + ack
const p = (event, arg) => ensureConnect().then(() =>
  new Promise((resolve, reject) =>
    socket.emit(event, arg, resp =>
      resp.error ? reject(resp.error) : resolve(resp))));

export let createRoom = roomName =>
  p('room:create', { roomName, broadcasterName: 'anonymous' })
  .then(({ roomId, userId }) => {

    let fileRefreshRequest = Rx.Observable.create(observer =>
      socket.on('file:refresh', ({path}, ack) =>
        observer.onNext([path, ack]));

    return {
      sendFiles: fileTree => p('filelist:update', { roomId, fileTree }),
      switchFile: (fileName, fileType) => p('file:switch', { roomId, path: fileName, type: fileType }),
      updateCursor: (selection, pos) => p('cursor:update', { selection, pos }),
      insert: (pos, content) => p('editor:insert', { pos, content }),
      del: selection => p('editor:delete', { selection }),
      fileRefreshRequest
    }
  }
);
