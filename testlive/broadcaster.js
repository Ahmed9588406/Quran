const JANUS_SERVER = "http://192.168.1.29:8088/janus";
const BACKEND_BASE = "https://noneffusive-reminiscent-tanna.ngrok-free.dev:8080/api/v1/stream";

const params = new URLSearchParams(window.location.search);
const roomId = parseInt(params.get("roomId"));
const liveStreamId = parseInt(params.get("liveStreamId"));

document.getElementById("roomIdDisplay").innerText = roomId || "Missing";

let janus = null;
let pluginHandle = null;
let localStream = null;
let broadcasting = false;
let startTime = null;
let durationInterval = null;

function setStatus(text, type = 'idle') {
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

async function startBroadcast() {
  if (!roomId || !liveStreamId) {
    showAlert('Missing room ID or stream ID in URL', 'danger');
    return;
  }

  try {
    setStatus('Requesting microphone access...', 'connecting');
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    showAlert('Microphone ready!', 'success');
    startJanus();
  } catch (err) {
    console.error(err);
    showAlert('Microphone permission denied', 'danger');
    setStatus('Microphone access denied', 'idle');
  }
}

function startJanus() {
  setStatus('Connecting to server...', 'connecting');
  Janus.init({
    debug: "all",
    callback: function () {
      janus = new Janus({
        server: JANUS_SERVER,
        success: attachPlugin,
        error: err => {
          setStatus('Connection error', 'idle');
          showAlert('Janus error: ' + err, 'danger');
        },
        destroyed: () => setStatus('Connection closed', 'idle')
      });
    }
  });
}

function attachPlugin() {
  setStatus('Joining room...', 'connecting');
  janus.attach({
    plugin: "janus.plugin.videoroom",
    success: function (handle) {
      pluginHandle = handle;
      joinRoomAsPublisher();
    },
    error: err => {
      setStatus('Failed to join', 'idle');
      showAlert('Plugin error: ' + err, 'danger');
    },
    onmessage: function (msg, jsep) {
      const event = msg["videoroom"];
      console.log("Plugin message:", msg);

      if (event === "joined") {
        setStatus('Publishing audio...', 'connecting');
        pluginHandle.createOffer({
          media: { audio: true, video: false },
          stream: localStream,
          success: jsep => {
            const publish = { request: "publish", audio: true, video: false };
            pluginHandle.send({ message: publish, jsep: jsep });
          },
          error: err => {
            setStatus('Publish error', 'idle');
            showAlert('Offer error: ' + err, 'danger');
          }
        });
      } else if (event === "event" && msg["configured"] === "ok") {
        broadcasting = true;
        startTime = Date.now();
        setStatus('🔴 LIVE - Broadcasting', 'live');
        showAlert('You are now LIVE!', 'success');
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('endBtn').style.display = 'block';
        startDurationCounter();
        startListenerPolling();
      }

      if (jsep) pluginHandle.handleRemoteJsep({ jsep: jsep });
    }
  });
}

function joinRoomAsPublisher() {
  const join = {
    request: "join",
    room: roomId,
    ptype: "publisher",
    display: "Broadcaster"
  };
  pluginHandle.send({ message: join });
}

function startDurationCounter() {
  durationInterval = setInterval(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('duration').innerText = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }, 1000);
}

function startListenerPolling() {
  setInterval(async () => {
    try {
      const response = await fetch(`${BACKEND_BASE}/${liveStreamId}/listeners`);
      const data = await response.json();
      document.getElementById('listenerCount').innerText = data.listeners;
    } catch (error) {
      console.error('Error polling listeners:', error);
    }
  }, 3000);
}

async function endBroadcast() {
  if (!confirm('Are you sure you want to end this stream?')) return;

  try {
    const response = await fetch(`${BACKEND_BASE}/${liveStreamId}/end`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      showAlert('Stream ended successfully!', 'success');
      
      if (pluginHandle) {
        pluginHandle.hangup();
      }
      if (janus) {
        janus.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (durationInterval) {
        clearInterval(durationInterval);
      }
      
      broadcasting = false;
      setStatus('Stream ended', 'idle');
      document.getElementById('endBtn').disabled = true;
      
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      showAlert('Failed to end stream', 'danger');
    }
  } catch (error) {
    showAlert('Error ending stream: ' + error.message, 'danger');
  }
}

window.addEventListener('beforeunload', (e) => {
  if (broadcasting) {
    e.preventDefault();
    e.returnValue = 'Stream is still live. Are you sure you want to leave?';
  }
});
