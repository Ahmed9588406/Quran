"use client"

type Props = {
  title?: string;
  description?: string;
  note?: string;
};

export default function EmptyState({
  title = 'Wesal for Windows',
  description = 'Send and receive messages without keeping your phone online.',
  note = 'Use WhatsApp on up to 4 linked devices and 1 phone at the same time.',
}: Props) {
  // Beige/cream background with subtle pattern
  const bgStyle = {
    backgroundColor: '#F5E6D3',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(215, 186, 131, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(215, 186, 131, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(215, 186, 131, 0.1) 0%, transparent 70%)
    `,
  };

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-center px-8"
      style={bgStyle}
    >
      <div className="text-center">
        <h2 className="text-2xl font-light text-gray-700 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto">{note}</p>
      </div>
    </div>
  );
}
