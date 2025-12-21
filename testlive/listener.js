const JANUS_SERVER = "http://192.168.1.29:8088/janus";
const BACKEND_BASE = "https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream";

const params = new URLSearchParams(window.location.search);
const roomId = parseInt(params.get("roomId"));
const liveStreamId = parseInt(params.get("liveStreamId")) || roomId;
const userId = Math.floor(Math.random() * 1000000);

document.getElementById("roomIdDisplay").innerText = roomId || "Missing";

let janus = null;
let discoveryHandle = null;
let subscribed = false;
let streamCheckInterval = null;

function setStatus(text, type = 'connecting') {
  document.getElementById('statusText').innerText = text;
  const indicator = document.getElementById('statusIndicator');
  indicator.className = `status-indicator ${type}`;
}

function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  document.getElementById('alertContainer').appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

async function checkStreamStatus() {
  try {
    const response = await fetch(`${BACKEND_BASE}/${liveStreamId}/info`);
    const data = await response.json();
    
    if (data.status === 'ENDED') {
      handleStreamEnded(data.totalViews);
      return false;
    }
    
    document.getElementById('listenerCount').innerText = data.listenerCount || 0;
    return true;
  } catch (error) {
    console.error('Error checking stream status:', error);
    return true;
  }
}

function handleStreamEnded(totalViews) {
  setStatus('Stream Ended', 'ended');
  showAlert('The broadcaster has ended this stream', 'warning');
  
  document.getElementById('audioContainer').style.display = 'none';
  document.getElementById('playBtn').style.display = 'none';
  document.getElementById('listenerBox').style.display = 'none';
  document.getElementById('streamEndedContainer').style.display = 'block';
  document.getElementById('totalViews').innerText = totalViews || 0;
  
  if (streamCheckInterval) {
    clearInterval(streamCheckInterval);
  }
  
  if (janus) {
    janus.destroy();
  }
  
  notifyLeave();
}

async function notifyJoin() {
  try {
    await fetch(`${BACKEND_BASE}/${liveStreamId}/join?userId=${userId}`, { method: "POST" });
    console.log("Notified backend: user joined");
  } catch (err) {
    console.error("Failed to notify join:", err);
  }
}

async function notifyLeave() {
  try {
    await fetch(`${BACKEND_BASE}/${liveStreamId}/leave?userId=${userId}`, { method: "POST" });
    console.log("Notified backend: user left");
  } catch (err) {
    console.error("Failed to notify leave:", err);
  }
}

window.addEventListener("beforeunload", () => {
  notifyLeave();
});

async function initialize() {
  if (!roomId || !liveStreamId) {
    showAlert('Missing room ID or stream ID in URL', 'danger');
    setStatus('Configuration error', 'idle');
    return;
  }

  const isActive = await checkStreamStatus();
  if (!isActive) {
    return;
  }

  notifyJoin();
  startJanus();
  
  streamCheckInterval = setInterval(async () => {
    const isActive = await checkStreamStatus();
    if (!isActive && streamCheckInterval) {
      clearInterval(streamCheckInterval);
    }
  }, 5000);
}

function startJanus() {
  setStatus('Connecting to server...', 'connecting');
  Janus.init({
    debug: "all",
    callback: function () {
      janus = new Janus({
        server: JANUS_SERVER,
        success: attachDiscoveryHandle,
        error: function (err) {
          console.error("Janus error:", err);
          setStatus('Connection error', 'idle');
          showAlert('Failed to connect to stream server', 'danger');
        }
      });
    }
  });
}

function attachDiscoveryHandle() {
  setStatus('Joining room...', 'connecting');
  janus.attach({
    plugin: "janus.plugin.videoroom",
    success: function (handle) {
      discoveryHandle = handle;
      console.log("Discovery handle attached:", discoveryHandle.getId());

      const joinReq = {
        request: "join",
        room: roomId,
        ptype: "publisher",
        display: "Listener",
        audio: false,
        video: false
      };
      discoveryHandle.send({ message: joinReq });
      setStatus('Waiting for broadcaster...', 'connecting');
    },
    error: function (err) {
      console.error("Discovery attach error:", err);
      setStatus('Failed to join', 'idle');
      showAlert('Error joining room', 'danger');
    },
    onmessage: function (msg, jsep) {
      console.log("Discovery handle onmessage:", msg);

      let publishers = [];
      if (Array.isArray(msg.publishers)) publishers = msg.publishers;
      else if (msg.plugindata?.data?.publishers) publishers = msg.plugindata.data.publishers;
      else if (Array.isArray(msg.participants)) publishers = msg.participants.filter(p => p.publisher);

      if (publishers && publishers.length > 0) {
        const feedId = publishers[0].id;
        console.log("Found publisher feed:", feedId);
        setStatus('Connecting to stream...', 'connecting');
        subscribeToFeed(feedId);
      } else {
        setStatus('Waiting for broadcaster...', 'connecting');
      }
    },
    oncleanup: function () {
      console.log("Discovery handle cleaned up");
    }
  });
}

function subscribeToFeed(feedId) {
  if (subscribed) return;
  janus.attach({
    plugin: "janus.plugin.videoroom",
    success: function (subHandle) {
      console.log("Subscriber handle attached:", subHandle.getId());

      const subReq = {
        request: "join",
        room: roomId,
        ptype: "subscriber",
        feed: feedId,
        offer_audio: true,
        offer_video: false
      };
      subHandle.send({ message: subReq });

      subHandle.onmessage = function (msg, jsep) {
        console.log("Subscriber onmessage:", msg);
        if (jsep) {
          subHandle.createAnswer({
            jsep: jsep,
            media: {
              audioSend: false,
              videoSend: false,
              audioRecv: true,
              videoRecv: false
            },
            success: function (jsepAnswer) {
              console.log("Subscriber created answer, sending start");
              subHandle.send({ message: { request: "start" }, jsep: jsepAnswer });
            },
            error: function (err) {
              console.error("createAnswer error:", err);
              setStatus('Connection error', 'idle');
              showAlert('Failed to receive stream', 'danger');
            }
          });
        }
      };

      subHandle.onremotestream = function (stream) {
        console.log("Subscriber got remote stream:", stream);
        attachRemoteStreamToAudio(stream);
        subscribed = true;
      };

      subHandle.onremotetrack = function (track, mid, on) {
        console.log("Subscriber onremotetrack:", track, mid, on);
        if (track && track.kind === 'audio') {
          const stream = new MediaStream([track]);
          attachRemoteStreamToAudio(stream);
          subscribed = true;
        }
      };

      subHandle.oncleanup = function () {
        console.log("Subscriber cleaned up");
      };
    },
    error: function (err) {
      console.error("Subscriber attach error:", err);
      setStatus('Failed to subscribe', 'idle');
      showAlert('Error subscribing to stream', 'danger');
    }
  });
}

function attachRemoteStreamToAudio(stream) {
  const audioEl = document.getElementById('remoteAudio');
  audioEl.srcObject = stream;
  console.log("Attached stream to audio element");

  document.getElementById('audioContainer').style.display = 'block';

  audioEl.play().then(() => {
    try { 
      audioEl.muted = false; 
      setStatus('🎶 Playing live audio', 'live');
      showAlert('Connected to live stream!', 'success');
    } catch(e) {
      console.warn('Could not unmute:', e);
      document.getElementById('playBtn').style.display = 'block';
    }
  }).catch(err => {
    console.warn("Autoplay prevented:", err);
    setStatus('Ready to play', 'live');
    showAlert('Click the button below to start audio', 'info');
    document.getElementById('playBtn').style.display = 'block';
  });
}

function manualPlay() {
  const audioEl = document.getElementById('remoteAudio');
  audioEl.muted = false;
  audioEl.volume = 1;
  audioEl.play().then(() => {
    setStatus('🎶 Playing live audio', 'live');
    showAlert('Audio started!', 'success');
    document.getElementById('playBtn').style.display = 'none';
  }).catch(err => {
    console.error("Manual play error:", err);
    showAlert('Failed to play audio: ' + err.message, 'danger');
  });
}

initialize();
