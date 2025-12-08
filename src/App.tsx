import React from 'react';
import PostsList from './components/PostsList';

export default function App() {
	return (
		<div style={{ padding: 20 }}>
			{/* If you want to explicitly pass a userId: <PostsList userId="123" /> */}
			<PostsList />
		</div>
	);
}
