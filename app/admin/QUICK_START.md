# Admin Dashboard - Quick Start Guide

## 🚀 Getting Started

### 1. Access the Dashboard
Navigate to `/admin` in your browser.

### 2. Login
Enter your admin JWT token when prompted. The token will be saved for future sessions.

### 3. Dashboard Overview
You'll see three main tabs:
- **🕌 Mosques** - Manage mosque locations
- **📡 Rooms** - Manage live streaming rooms
- **👤 Preachers** - View registered preachers

## 📋 Common Tasks

### Creating Your First Mosque

1. Click the **Mosques** tab
2. Click **"Create Mosque"** button
3. Fill in the form:
   ```
   Mosque Name: Grand Mosque Cairo
   City: Cairo
   Country: Egypt
   Address: 123 Main Street
   QR Code URL: grand-mosque-cairo
   Assign Preacher: (Select from dropdown)
   ```
4. Click **"Create Mosque"**

### Setting Up a Live Stream

1. **Create a Room**
   - Go to **Rooms** tab
   - Click **"Create Room"**
   - Select a mosque (must have an assigned preacher)
   - Add optional title: "Friday Prayer - Dec 22"
   - Click **"Create Room"**

2. **Get the Links**
   - After creation, a modal will show two links:
   - **Preacher Link**: Send this to the preacher to broadcast
   - **Listener Link**: Share this with the audience

3. **Share the Links**
   - Click "Copy" next to each link
   - Send the preacher link via WhatsApp/Email to the preacher
   - Share the listener link on social media or your website

### Managing Active Streams

#### Start Recording
- Find the active room card
- Click **"⏺️ Record"** button
- Recording starts immediately

#### Stop Recording
- Click **"⏹️ Stop"** button
- Recording is saved automatically

#### End Stream
- Click **"🛑 End"** button
- Confirm the action
- Stream ends and final stats are saved

#### Play Recording
- After stream ends, click **"▶️ Play"** button
- Audio player will open with the recording

## 💡 Tips & Best Practices

### Mosque Management
- ✅ Always assign a preacher to a mosque before creating rooms
- ✅ Use descriptive QR code URLs (e.g., "grand-mosque-cairo")
- ✅ Keep mosque information up to date

### Room Management
- ✅ Add descriptive titles to rooms (e.g., "Friday Prayer - Dec 22")
- ✅ Create rooms in advance for scheduled prayers
- ✅ Monitor listener counts during live streams
- ✅ Always end streams properly to save statistics

### Recording Best Practices
- ✅ Start recording at the beginning of the prayer
- ✅ Stop recording after the prayer ends
- ✅ Test playback to ensure quality
- ✅ Recordings are stored on the server

## 🎨 UI Features

### Color Coding
- **Emerald/Green** - Mosque-related features
- **Cyan/Blue** - Room/streaming features
- **Violet/Purple** - Preacher-related features

### Status Indicators
- **🟢 Active** - Stream is currently live
- **🔴 Ended** - Stream has finished
- **🟡 Pending** - Room created but not started

### Real-time Updates
- Listener counts update every 3 seconds
- Click the refresh button (🔄) in the header to manually refresh all data

## 🔧 Troubleshooting

### Can't Create a Room?
- Make sure the mosque has an assigned preacher
- Only mosques with preachers appear in the dropdown

### Links Not Working?
- Verify the room is in "ACTIVE" status
- Check that the preacher has the correct link
- Ensure the Janus server is running

### Recording Not Playing?
- Wait a moment for the recording to be processed
- Check your browser's audio permissions
- Try refreshing the page

### Token Expired?
- Click "Logout" in the header
- Enter a new valid JWT token
- Your session will be restored

## 📱 Mobile Access

The dashboard is fully responsive and works on:
- 📱 Mobile phones (portrait and landscape)
- 📱 Tablets
- 💻 Desktop computers

## 🔐 Security

- Never share your admin token
- Logout when using shared computers
- Tokens are stored securely in localStorage
- All API calls are authenticated

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your token is valid
3. Ensure the backend API is running
4. Contact your system administrator

## 🎯 Next Steps

1. ✅ Create your first mosque
2. ✅ Assign a preacher
3. ✅ Create a test room
4. ✅ Test the broadcaster and listener links
5. ✅ Try recording a test stream
6. ✅ Share the listener link with your community

---

**Happy Streaming! 🎉**
