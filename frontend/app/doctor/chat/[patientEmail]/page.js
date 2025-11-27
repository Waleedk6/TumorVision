'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useChat } from '../../../hooks/useChat';
import AuthGuard from '../../../components/AuthGuard';
import { Send, Loader2, User } from 'lucide-react';

// Helper to create deterministic room name
const createChatRoom = (email1, email2) => {
  if (!email1 || !email2) return null;
  return [email1, email2].sort().join('_');
};

export default function DoctorChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  
  const patientEmail = params.patientEmail ? decodeURIComponent(params.patientEmail) : null;
  const room = createChatRoom(user?.email, patientEmail);
  const { messages, isConnected, loadingHistory, sendMessage } = useChat(room);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  // ✅ FIXED ChatBubble: Green for doctor's messages
  const ChatBubble = ({ msg }) => {
    const isMe = msg.sender_email === user?.email;
    const sender = isMe ? 'You' : 'Patient';

    // Convert URLs to clickable links
    const renderMessageWithLinks = (text) => {
      const urlRegex = /(https?:\/\/[^\s<>"\]{}]+(?=\s|$))/g;
      return text.split(urlRegex).map((part, index) => {
        if (index % 2 === 1) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-700"
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      });
    };

    return (
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
        <div
          className={`
            max-w-[calc(100vw-120px)] sm:max-w-xs md:max-w-md 
            p-3 rounded-xl shadow-md
            ${isMe ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}
          `}
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          <p className="text-sm font-semibold mb-1 opacity-80">{sender}</p>
          <p>{renderMessageWithLinks(msg.message_text)}</p>
          <p className="text-xs opacity-60 mt-2 text-right">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard requiredRole="doctor">
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
        {/* Header */}
        <header className="bg-white p-4 border-b border-gray-200 shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-3 text-indigo-600" />
            Chat with: {patientEmail || '...'}
          </h2>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loadingHistory && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="ml-2 text-gray-600">Loading chat history...</p>
            </div>
          )}

          {!loadingHistory && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          )}

          {!loadingHistory && messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 shadow-inner">
          <div className="flex items-center bg-gray-100 rounded-xl p-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isConnected ? "Type your message..." : "Waiting to connect..."}
              className="flex-1 bg-transparent p-2 text-gray-800 placeholder-gray-500 focus:outline-none"
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected || !newMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}