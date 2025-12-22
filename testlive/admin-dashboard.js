const API_BASE = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1';
let adminToken = localStorage.getItem('adminToken') || '';
let mosques = [];
let rooms = [];
let preachers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (!adminToken) {
    showLoginPrompt();
  } else {
    loadAllData();
  }
});

function showLoginPrompt() {
  const token = prompt('Enter Admin JWT Token:');
  if (token) {
    adminToken = token;
    localStorage.setItem('adminToken', token);
    loadAllData();
  }
}

function logout() {
  localStorage.removeItem('adminToken');
  location.reload();
}

// Tab Management
function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Load Data
async function loadAllData() {
  await Promise.all([
    loadMosques(),
    loadRooms(),
    loadPreachers()
  ]);
}

async function loadMosques() {
  try {
    const response = await fetch(`${API_BASE}/mosques?size=100`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    mosques = data.content || [];
    renderMosques();
  } catch (error) {
    console.error('Error loading mosques:', error);
    showAlert('Failed to load mosques', 'error');
  }
}

async function loadRooms() {
  try {
    const response = await fetch(`${API_BASE}/stream/rooms?size=100`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    rooms = data.content || [];
    renderRooms();
  } catch (error) {
    console.error('Error loading rooms:', error);
  }
}

async function loadPreachers() {
  try {
    const response = await fetch(`${API_BASE}/preachers/list?size=100`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    preachers = data.content || [];
    renderPreachers();
  } catch (error) {
    console.error('Error loading preachers:', error);
  }
}

// Render Functions
function renderMosques() {
  const container = document.getElementById('mosques-list');
  if (mosques.length === 0) {
    container.innerHTML = '<p class="loading">No mosques found. Create one to get started.</p>';
    return;
  }
  
  container.innerHTML = mosques.map(mosque => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${mosque.name}</div>
          <div class="card-subtitle">${mosque.city || 'N/A'}, ${mosque.country || 'N/A'}</div>
        </div>
        <span class="badge ${mosque.active ? 'badge-success' : 'badge-danger'}">
          ${mosque.active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="info-row">
            <span class="info-label">Preacher:</span>
            <span>${mosque.preacher ? mosque.preacher.displayName : 'Not assigned'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Current Room:</span>
            <span>${mosque.currentRoomId || 'None'}</span>
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button onclick="showQRCode(${mosque.id}, '${mosque.qrCodeUrl}')" class="btn btn-info btn-sm">
          📱 QR Code
        </button>
        <button onclick="viewMosqueDetails(${mosque.id})" class="btn btn-secondary btn-sm">
          View Details
        </button>
        <button onclick="deleteMosque(${mosque.id})" class="btn btn-danger btn-sm">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

function renderRooms() {
  const container = document.getElementById('rooms-list');
  if (rooms.length === 0) {
    container.innerHTML = '<p class="loading">No rooms found. Create one to get started.</p>';
    return;
  }
  
  container.innerHTML = rooms.map(room => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${room.title || 'Untitled Room'}</div>
          <div class="card-subtitle">Room ID: ${room.roomId}</div>
        </div>
        <span class="badge ${room.status === 'ACTIVE' ? 'badge-success' : room.status === 'ENDED' ? 'badge-danger' : 'badge-warning'}">
          ${room.status}
        </span>
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="info-row">
            <span class="info-label">Mosque:</span>
            <span>${room.mosque ? room.mosque.name : 'Not assigned'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Preacher:</span>
            <span>${room.creator ? room.creator.displayName : 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Current Listeners:</span>
            <span>${room.listenerCount || 0}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Views:</span>
            <span style="font-weight: 600; color: #667eea;">${room.totalViews || 0}</span>
          </div>
          ${room.status === 'ENDED' && room.endedAt ? `
          <div class="info-row">
            <span class="info-label">Ended:</span>
            <span>${new Date(room.endedAt).toLocaleString()}</span>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="card-actions">
        ${room.status === 'ACTIVE' ? `
          <button onclick="startRecording(${room.roomId})" class="btn btn-success btn-sm">
            ⏺️ Start Recording
          </button>
          <button onclick="stopRecording(${room.roomId})" class="btn btn-warning btn-sm">
            ⏹️ Stop Recording
          </button>
          <button onclick="endStream(${room.id})" class="btn btn-danger btn-sm">
            🛑 End Stream
          </button>
        ` : ''}
        ${room.status === 'ENDED' ? `
          <button onclick="playRecording(${room.roomId})" class="btn btn-success btn-sm">
            ▶️ Play Recording
          </button>
          <button onclick="downloadRecording(${room.roomId})" class="btn btn-info btn-sm">
            ⬇️ Download Recording
          </button>
        ` : ''}
        <button onclick="copyPreacherLink(${room.roomId}, ${room.id})" class="btn btn-secondary btn-sm">
          🎤 Preacher Link
        </button>
        <button onclick="copyListenerLink(${room.roomId}, ${room.id})" class="btn btn-secondary btn-sm">
          🎧 Listener Link
        </button>
        <button onclick="deleteRoom(${room.id})" class="btn btn-danger btn-sm">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

function renderPreachers() {
  const container = document.getElementById('preachers-list');
  if (preachers.length === 0) {
    container.innerHTML = '<p class="loading">No preachers found.</p>';
    return;
  }
  
  container.innerHTML = preachers.map(preacher => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${preacher.displayName || preacher.username}</div>
          <div class="card-subtitle">@${preacher.username}</div>
        </div>
        ${preacher.verified ? '<span class="badge badge-success">✓ Verified</span>' : ''}
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span>${preacher.email || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Bio:</span>
            <span>${preacher.bio || 'No bio'}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Modal Functions
function showCreateMosqueModal() {
  const modal = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Create New Mosque</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="create-mosque-form" onsubmit="createMosque(event)">
            <div class="form-group">
              <label class="form-label">Mosque Name *</label>
              <input type="text" name="name" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Address</label>
              <input type="text" name="address" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" name="city" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <input type="text" name="country" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">QR Code URL *</label>
              <input type="text" name="qrCodeUrl" class="form-control" 
                     placeholder="e.g., grand-mosque-cairo" required>
              <small style="color: #6c757d;">This will be used to generate the QR code</small>
            </div>
            <div class="form-group">
              <label class="form-label">Assign Preacher</label>
              <select name="preacherId" class="form-control">
                <option value="">Select Preacher (Optional)</option>
                ${preachers.map(p => `<option value="${p.id}">${p.displayName}</option>`).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
          <button onclick="document.getElementById('create-mosque-form').requestSubmit()" 
                  class="btn btn-primary">Create Mosque</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = modal;
}

function showCreateRoomModal() {
  const modal = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Create New Room</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="create-room-form" onsubmit="createRoom(event)">
            <div class="form-group">
              <label class="form-label">Select Mosque *</label>
              <select name="mosqueId" class="form-control" required>
                <option value="">Choose a mosque</option>
                ${mosques.filter(m => m.preacher).map(m => 
                  `<option value="${m.id}">${m.name} (${m.preacher.displayName})</option>`
                ).join('')}
              </select>
              <small style="color: #6c757d;">Only mosques with assigned preachers are shown</small>
            </div>
            <div class="form-group">
              <label class="form-label">Room Title</label>
              <input type="text" name="title" class="form-control" 
                     placeholder="e.g., Friday Prayer - Dec 15">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea name="description" class="form-control" rows="3" 
                        placeholder="Optional description"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
          <button onclick="document.getElementById('create-room-form').requestSubmit()" 
                  class="btn btn-primary">Create Room</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = modal;
}

function closeModal(event) {
  if (!event || event.target.classList.contains('modal-overlay')) {
    document.getElementById('modal-container').innerHTML = '';
  }
}

// CRUD Operations
async function createMosque(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    address: formData.get('address'),
    city: formData.get('city'),
    country: formData.get('country'),
    qrCodeUrl: formData.get('qrCodeUrl'),
    preacherId: formData.get('preacherId') || null
  };
  
  try {
    const response = await fetch(`${API_BASE}/mosques`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showAlert('Mosque created successfully!', 'success');
      closeModal();
      await loadMosques();
    } else {
      const error = await response.json();
      showAlert(error.message || 'Failed to create mosque', 'error');
    }
  } catch (error) {
    showAlert('Error creating mosque: ' + error.message, 'error');
  }
}

async function createRoom(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    mosqueId: parseInt(formData.get('mosqueId')),
    title: formData.get('title'),
    description: formData.get('description')
  };
  
  try {
    const response = await fetch(`${API_BASE}/stream/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const room = await response.json();
      showAlert('Room created successfully! Redirect URL updated automatically.', 'success');
      closeModal();
      await loadRooms();
      await loadMosques();
      
      // Show success modal with links
      showRoomCreatedModal(room);
    } else {
      const error = await response.json();
      showAlert(error.message || 'Failed to create room', 'error');
    }
  } catch (error) {
    showAlert('Error creating room: ' + error.message, 'error');
  }
}

async function deleteMosque(id) {
  if (!confirm('Are you sure you want to delete this mosque?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/mosques/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (response.ok) {
      showAlert('Mosque deleted successfully', 'success');
      await loadMosques();
    } else {
      showAlert('Failed to delete mosque', 'error');
    }
  } catch (error) {
    showAlert('Error deleting mosque: ' + error.message, 'error');
  }
}

async function deleteRoom(id) {
  if (!confirm('Are you sure you want to delete this room?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/stream/rooms/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (response.ok) {
      showAlert('Room deleted successfully', 'success');
      await loadRooms();
    } else {
      showAlert('Failed to delete room', 'error');
    }
  } catch (error) {
    showAlert('Error deleting room: ' + error.message, 'error');
  }
}

// Utility Functions
function showQRCode(mosqueId, qrCodeUrl) {
  const fullUrl = `${window.location.origin}/qr-redirect.html?qr=${encodeURIComponent(qrCodeUrl)}`;
  
  const modal = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Mosque QR Code</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="qr-code">
            <div id="qrcode"></div>
            <p style="margin-top: 16px; font-size: 14px; color: #6c757d;">
              Scan this QR code to join the live stream
            </p>
            <p style="margin-top: 8px; font-size: 12px; word-break: break-all;">
              ${fullUrl}
            </p>
          </div>
          <button onclick="copyToClipboard('${fullUrl}')" class="btn btn-primary" style="width: 100%;">
            Copy URL
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = modal;
  
  // Generate QR code using a simple library (you'll need to include qrcode.js)
  new QRCode(document.getElementById("qrcode"), {
    text: fullUrl,
    width: 200,
    height: 200
  });
}

function copyPreacherLink(roomId, liveStreamId) {
  const url = `${window.location.origin}/broadcaster.html?roomId=${roomId}&liveStreamId=${liveStreamId}`;
  copyToClipboard(url);
  showAlert('Preacher link copied! Share this with the preacher to broadcast.', 'success');
}

function copyListenerLink(roomId, liveStreamId) {
  const url = `${window.location.origin}/listener.html?roomId=${roomId}&liveStreamId=${liveStreamId}`;
  copyToClipboard(url);
  showAlert('Listener link copied!', 'success');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

function showRoomCreatedModal(room) {
  const preacherLink = `${window.location.origin}/broadcaster.html?roomId=${room.roomId}&liveStreamId=${room.id}`;
  const listenerLink = `${window.location.origin}/listener.html?roomId=${room.roomId}&liveStreamId=${room.id}`;
  
  const modal = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">✅ Room Created Successfully!</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-success">
            Room created and automatically assigned to mosque!<br>
            Redirect URL has been updated.
          </div>
          
          <div class="form-group">
            <label class="form-label">🎤 Preacher Broadcast Link</label>
            <input type="text" class="form-control" value="${preacherLink}" readonly>
            <button onclick="copyToClipboard('${preacherLink}')" class="btn btn-success btn-sm" 
                    style="margin-top: 8px; width: 100%;">
              Copy Preacher Link
            </button>
          </div>
          
          <div class="form-group">
            <label class="form-label">🎧 Listener Link</label>
            <input type="text" class="form-control" value="${listenerLink}" readonly>
            <button onclick="copyToClipboard('${listenerLink}')" class="btn btn-info btn-sm" 
                    style="margin-top: 8px; width: 100%;">
              Copy Listener Link
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick="closeModal()" class="btn btn-primary">Done</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = modal;
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '10000';
  alertDiv.style.minWidth = '300px';
  alertDiv.style.animation = 'slideIn 0.3s';
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

function viewMosqueDetails(id) {
  const mosque = mosques.find(m => m.id === id);
  if (!mosque) return;
  
  const modal = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">${mosque.name}</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="card-info">
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span>${mosque.address || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">City:</span>
              <span>${mosque.city || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Country:</span>
              <span>${mosque.country || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">QR Code URL:</span>
              <span>${mosque.qrCodeUrl}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Redirect URL:</span>
              <span style="word-break: break-all;">${mosque.redirectUrl || 'Not set'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Current Room:</span>
              <span>${mosque.currentRoomId || 'None'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Preacher:</span>
              <span>${mosque.preacher ? mosque.preacher.displayName : 'Not assigned'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = modal;
}


// Recording Functions
async function startRecording(roomId) {
  try {
    const response = await fetch(`${API_BASE}/stream/${roomId}/record/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    if (data.success) {
      showAlert('Recording started successfully!', 'success');
    } else {
      showAlert('Failed to start recording', 'error');
    }
  } catch (error) {
    showAlert('Error starting recording: ' + error.message, 'error');
  }
}

async function stopRecording(roomId) {
  try {
    const response = await fetch(`${API_BASE}/stream/${roomId}/record/stop`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    if (data.success) {
      showAlert('Recording stopped! You can download it now.', 'success');
      await loadRooms(); // Refresh to show download button
    } else {
      showAlert('Failed to stop recording', 'error');
    }
  } catch (error) {
    showAlert('Error stopping recording: ' + error.message, 'error');
  }
}

function downloadRecording(roomId) {
  const url = `${API_BASE}/stream/${roomId}/record/download`;
  
  showAlert('Downloading recording... This may take a moment if conversion is needed.', 'info');
  
  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `room_${roomId}_recording`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show additional info after 2 seconds
  setTimeout(() => {
    showAlert('If download fails, you may need to install Janus post-processing tools. See RECORDING_SETUP_GUIDE.md', 'warning');
  }, 2000);
}

async function endStream(liveStreamId) {
  if (!confirm('Are you sure you want to end this stream? This cannot be undone.')) return;
  
  try {
    const response = await fetch(`${API_BASE}/stream/${liveStreamId}/end`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    if (data.success) {
      showAlert('Stream ended successfully!', 'success');
      await loadRooms();
    } else {
      showAlert('Failed to end stream', 'error');
    }
  } catch (error) {
    showAlert('Error ending stream: ' + error.message, 'error');
  }
}

function playRecording(roomId) {
  const modal = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()" style="max-width: 800px;">
        <div class="modal-header">
          <h3 class="modal-title">🎵 Play Recording - Room ${roomId}</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; padding: 20px;">
            <p style="margin-bottom: 20px; color: #6c757d;">
              Loading recording... This may take a moment for conversion.
            </p>
            <audio id="recordingPlayer" controls autoplay style="width: 100%; max-width: 600px;">
              <source src="${API_BASE}/stream/${roomId}/record/play" type="audio/wav">
              Your browser does not support the audio element.
            </audio>
            <div id="audioError" style="display: none; margin-top: 20px; padding: 15px; background: #f8d7da; color: #721c24; border-radius: 8px;">
              <strong>⚠️ Playback Error</strong>
              <p>Could not load recording. This may happen if:</p>
              <ul style="text-align: left; margin: 10px 0;">
                <li>Janus post-processing tools are not installed</li>
                <li>Recording file is corrupted</li>
                <li>Conversion failed</li>
              </ul>
              <p style="margin-top: 10px;">
                <strong>Solution:</strong> Run the installation script:
                <code style="background: #fff; padding: 2px 6px; border-radius: 4px;">bash install-janus-tools.sh</code>
              </p>
              <button onclick="downloadRecording(${roomId}); closeModal();" class="btn btn-info" style="margin-top: 10px;">
                Try Downloading Instead
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick="downloadRecording(${roomId})" class="btn btn-info">
            ⬇️ Download Recording
          </button>
          <button onclick="closeModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('modal-container').innerHTML = modal;
  
  // Handle audio loading errors
  setTimeout(() => {
    const audio = document.getElementById('recordingPlayer');
    if (audio) {
      audio.addEventListener('error', function() {
        document.getElementById('audioError').style.display = 'block';
        showAlert('Failed to load recording. See modal for details.', 'error');
      });
      
      audio.addEventListener('loadeddata', function() {
        showAlert('Recording loaded successfully!', 'success');
      });
    }
  }, 100);
}
