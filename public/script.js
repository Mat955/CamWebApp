const socket = io('/');
const videoGrid = document.getElementById('main__videos__grid');
const myVideo = document.createElement('video');
const muteAudioButton = document.querySelector('.main__mute_button');
const playStopVideoButton = document.querySelector('.main__video_button');
myVideo.muted = true;
let myVideoStream

const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3000'
});

const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  });

  let messageText = $('input');
  $('html').keydown((e) => {
    if (e.which == 13 && messageText.val().length !== 0) {
      socket.emit('message', messageText.val());
      messageText.val('');
    }
  });

  socket.on('createMessage', message => {
    $('.messages').append(`<li class="message"><b>user</b></br>${message}</li>`);
    scrollToBottom();
  });
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove();
  })
  peers[userId] = call;
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let windowChat = $('.main__chat_window');
  windowChat.scrollTop(windowChat.prop('scrollHeight'));
}

const muteUnmuteVideo = () => {
  const audioTrack = myVideoStream.getAudioTracks()[0];
  const enabled = audioTrack.enabled;
  if (enabled) {
    audioTrack.enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    audioTrack.enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  muteAudioButton.innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  muteAudioButton.innerHTML = html;
};

const playStopVideo = () => {
  const videoTrack = myVideoStream.getVideoTracks()[0];
  const enabled = videoTrack.enabled;
  if (enabled) {
    videoTrack.enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    videoTrack.enabled = true;
  }
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  playStopVideoButton.innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  playStopVideoButton.innerHTML = html;
};