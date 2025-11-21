'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation'; // <-- Correct import
import { useAuth } from '../../../hooks/useAuth';
import { useChat } from '../../../hooks/useChat'; // Assuming this is at /hooks/useChat.js
import AuthGuard from '../../../components/AuthGuard';
import { Send, Loader2, MessageCircle, User } from 'lucide-react';

// This function creates a consistent, sorted room ID
// So "patient_doctor" is the same as "doctor_patient"
const createChatRoom = (email1, email2) => {
  if (!email1 || !email2) return null;
  return [email1, email2].sort().join('_');
};

// --- 1. NEW HELPER COMPONENT FOR CLICKABLE LINKS ---
const LinkifiedText = ({ text, isMe }) => {
  // Regex to find URLs (http, https, www)
  // \S+ means one or more non-whitespace characters
  const urlRegex = /(https?:\/\/\S+|www\.\S+)/g;
  
  if (!text) return null;

  const parts = text.split(urlRegex);
  const linkClass = isMe
    ? 'text-blue-200 underline hover:text-blue-100 font-medium' // Links on dark/green bubble
    : 'text-blue-600 underline hover:text-blue-800 font-medium'; // Links on light/gray bubble

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          // Add http:// to www. links for them to work
          const href = part.startsWith('www.') ? `http://${part}` : part;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              // Prevents click from bubbling up if the bubble is clickable
              onClick={(e) => e.stopPropagation()} 
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};
// --- END OF NEW COMPONENT ---


export default function PatientChatPage() {
  const { user } = useAuth(); // Patient's info
  const params = useParams();
  const [newMessage, setNewMessage] = useState('');
  
  const doctorEmail = params.doctorEmail ? decodeURIComponent(params.doctorEmail) : null;

  const room = createChatRoom(user?.email, doctorEmail);
  
  const { messages, isConnected, loadingHistory, sendMessage } = useChat(room);
  const messagesEndRef = useRef(null);

  // Scroll to bottom effect
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

  const ChatBubble = ({ msg }) => {
    const isMe = msg.sender_email === user?.email;
    const bubbleClass = isMe
      ? 'bg-green-600 text-white self-end'
      : 'bg-gray-200 text-gray-800 self-start';
    const sender = msg.sender_type === 'doctor' ? 'Doctor' : 'You';

    return (
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
        <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${bubbleClass}`}>
          <p className="text-sm font-semibold mb-1 opacity-80">{sender}</p>
          
          {/* --- 2. THIS IS THE FIX --- */}
          {/* We apply 'break-words' to the <p> tag */}
          {/* And use our new <LinkifiedText> component inside */}
          <p className="break-words">
            <LinkifiedText text={msg.message_text} isMe={isMe} />
          </p>
          {/* --- END OF FIX --- */}
          
          <p className="text-xs opacity-60 mt-2 text-right">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard requiredRole="patient">
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50"> {/* Adjust height as needed */}
        {/* Header */}
        <header className="bg-white p-4 border-b border-gray-200 shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-3 text-green-600" />
            Chat with Doctor
          </h2>
          <p className="text-sm text-gray-500">{doctorEmail}</p>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loadingHistory && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <p className="ml-2 text-gray-600">Loading chat history...</p>
            </div>
          )}
          {!loadingHistory && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No messages yet. Ask a question to get started!</p>
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
              className="p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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