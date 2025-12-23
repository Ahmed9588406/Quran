# Admin Dashboard

A modern, feature-rich admin dashboard for managing mosque live streaming operations.

## Features

### 🕌 Mosque Management
- Create and manage mosques
- Assign preachers to mosques
- Generate QR codes for easy access
- Track active/inactive status
- View detailed mosque information

### 📡 Room Management
- Create live streaming rooms
- Monitor active streams in real-time
- View listener counts and total views
- Start/stop recording functionality
- End streams remotely
- Generate broadcaster and listener links
- Automatic room assignment to mosques

### 👤 Preacher Management
- View all registered preachers
- See verification status
- Access preacher profiles and bios
- Track preacher assignments

## Design System

### Color Palette
- **Background**: `#0a0a0f` (Deep dark)
- **Cards**: `#12121a` with transparency
- **Emerald**: Mosque-related features
- **Cyan**: Room/streaming features
- **Violet**: Preacher-related features

### Components

#### AdminHeader
- Sticky header with logo and stats
- Quick stats pills showing counts
- Refresh button with loading state
- Logout functionality

#### TabNavigation
- Smooth tab switching
- Color-coded tabs matching feature colors
- Active state indicators

#### MosquesTab
- Grid layout of mosque cards
- Create mosque modal
- View details modal
- Delete functionality
- Preacher assignment

#### RoomsTab
- Grid layout of room cards
- Real-time status indicators (ACTIVE/ENDED/PENDING)
- Recording controls
- Stream management
- Link generation and copying
- Listener count tracking

#### PreachersTab
- Grid layout of preacher cards
- Verification badges
- Profile information display

#### Toast Notifications
- Success, error, info, and warning types
- Auto-dismiss after 4 seconds
- Smooth animations

#### Modal
- Backdrop blur effect
- Smooth enter/exit animations
- Click outside to close
- Customizable footer

## Usage

### Authentication
1. Navigate to `/admin`
2. Enter your admin JWT token
3. Token is stored in localStorage for persistence

### Creating a Mosque
1. Go to Mosques tab
2. Click "Create Mosque"
3. Fill in required fields:
   - Mosque Name (required)
   - QR Code URL (required)
   - City, Country, Address (optional)
   - Assign Preacher (optional)
4. Click "Create Mosque"

### Creating a Room
1. Go to Rooms tab
2. Click "Create Room"
3. Select a mosque (only mosques with assigned preachers shown)
4. Add optional title and description
5. Click "Create Room"
6. Copy the generated broadcaster and listener links

### Managing Streams
- **Start Recording**: Click "Record" button on active room
- **Stop Recording**: Click "Stop" button
- **End Stream**: Click "End" button (requires confirmation)
- **Play Recording**: Click "Play" button on ended rooms

### Viewing Links
- Click "Links" button on any room card
- Copy broadcaster link for preachers
- Copy listener link for audience members

## API Integration

The dashboard integrates with the following API endpoints:

### Mosques
- `GET /api/admin/mosques?size=100` - List mosques
- `POST /api/admin/mosques` - Create mosque
- `DELETE /api/admin/mosques/:id` - Delete mosque

### Rooms
- `GET /api/admin/rooms?size=100` - List rooms
- `POST /api/admin/rooms` - Create room
- `DELETE /api/admin/rooms/:id` - Delete room

### Preachers
- `GET /api/admin/preachers?size=100` - List preachers

### Streaming
- `POST /api/admin/stream/:id?action=end` - End stream
- `POST /api/admin/stream/:id?action=record-start` - Start recording
- `POST /api/admin/stream/:id?action=record-stop` - Stop recording
- `GET /api/admin/stream/:id/record/play` - Play recording

## Technical Details

### State Management
- React hooks for local state
- localStorage for token persistence
- Callback-based data refresh

### Styling
- Tailwind CSS for utility-first styling
- Custom gradients and animations
- Responsive design (mobile, tablet, desktop)
- Dark theme with ambient effects

### Performance
- Optimized re-renders with useCallback
- Lazy loading of modals
- Efficient grid layouts
- Smooth transitions and animations

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security
- JWT token authentication
- Token stored in localStorage
- Automatic logout on token removal
- Confirmation dialogs for destructive actions

## Future Enhancements
- [ ] Real-time WebSocket updates for listener counts
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Export data functionality
- [ ] Analytics dashboard
- [ ] Role-based access control
- [ ] Audit logs
