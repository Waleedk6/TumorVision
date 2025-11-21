'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import api from '../../lib/api';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Your Flask server URL

export const useChat = (room) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!room || !user?.token) return;

    // 1. Fetch initial chat history
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await api.get(`/chat/history/${room}`);
        setMessages(response.data || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();

    // 2. Connect to Socket.IO
    // Disconnect any existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Connect new socket with the auth token
    socketRef.current = io(SOCKET_URL, {
      query: { token: user.token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      // Join the specific chat room
      socket.emit('join_room', { room });
      console.log(`Joined room: ${room}`);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    // 3. Listen for new messages
    socket.on('receive_message', (newMessage) => {
      console.log('Received message:', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // 4. Cleanup on unmount
    return () => {
      if (socket) {
        console.log('Cleaning up socket...');
        socket.emit('leave_room', { room });
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('receive_message');
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [room, user?.token]); // Re-run effect if room or token changes

  // 5. Send message function
  const sendMessage = (messageText) => {
    if (!socketRef.current || !isConnected || !messageText.trim()) return;

    socketRef.current.emit('send_message', {
      room: room,
      message_text: messageText,
    });
  };

  return { messages, isConnected, loadingHistory, sendMessage };
};