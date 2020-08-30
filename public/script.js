const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
};

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3000'
});

let myVideoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });
});

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};