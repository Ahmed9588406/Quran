export type ChatItem = {
  id: number;
  name: string;
  time: string;
  lastText: string;
  unread: number;
  avatar: string;
};

export const chats: ChatItem[] = [
  { id: 1, name: 'Groupe', time: '19:48', lastText: 'Chatgram Web was updated.', unread: 1, avatar: '/figma-assets/avatar-2404-27141.png' },
  { id: 2, name: 'Jessica Drew', time: '18:30', lastText: 'Ok, see you later', unread: 2, avatar: '/figma-assets/avatar-2001-1653.png' },
  { id: 3, name: 'David Moore', time: '18:16', lastText: "You: i don't remember anything 😄", unread: 0, avatar: '/figma-assets/avatar-2404-27141.png' },
  { id: 4, name: 'Emily Dorson', time: '17:42', lastText: 'Table for four, 5PM. Be there.', unread: 0, avatar: '/figma-assets/avatar-2001-1645.png' },
  { id: 5, name: 'Art Class', time: 'Tue', lastText: 'Emily: Editorial', unread: 0, avatar: '/figma-assets/avatar-2404-27141.png' },
];

export type Message = { id: string; from: 'me' | 'them'; text: string; time?: string };

export const initialMessages: Record<number, Message[]> = {
  1: [
    { id: 'm1', from: 'them', text: 'Chatgram Web was updated.', time: '19:48' },
    { id: 'm2', from: 'me', text: 'Nice!', time: '19:49' },
  ],
  2: [
    { id: 'm1', from: 'them', text: 'Ok, see you later', time: '18:30' },
  ],
  3: [
    { id: 'm1', from: 'them', text: "You: i don't remember anything 😄", time: '18:16' },
  ],
  4: [
    { id: 'm1', from: 'them', text: 'Table for four, 5PM. Be there.', time: '17:42' },
  ],
  5: [
    { id: 'm1', from: 'them', text: 'Emily: Editorial', time: 'Tue' },
  ],
};

export default chats;
