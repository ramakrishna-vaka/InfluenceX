// @ts-ignore
(window as any).global = window;
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Search, Clock } from 'lucide-react';
import { useAuth } from '../../AuthProvider';
import ChatArea from './ChatArea';
import '../css/Messages.css';
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

interface Message {
  id: string;
  sender: { id: number | undefined; name: string; };
  receiver: { id: number | undefined; name: string; };
  content: string;
  timestamp: string;
  isReadBy: boolean;
}

interface Chat {
  id: string;
  influencer: { id: number | undefined; name: string; };
  brand: { id: number | undefined; name: string; };
  status: string;
  createdAt: string;
  messageList: Message[];
  unReadMsgsCount: number;
  lastMessage: string;
  lastMsgTime: string;
}

const Messages: React.FC = () => {
  const { authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  
  const appliedUserId = searchParams.get('userId');
  const campaignId = searchParams.get('campaignId');

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const stompClientRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  // Fetch all chats on component mount
  useEffect(() => {
    if (authUser?.id) {
      fetchChats();
    }
  }, [authUser]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!authUser?.id) return;

    console.log("Initializing WebSocket connection...");
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);
    
    // Disable debug logs (optional)
    stompClient.debug = () => {};
    
    stompClientRef.current = stompClient;

    stompClient.connect({}, 
      () => {
        console.log("✅ Connected to WebSocket");
      },
      (error: any) => {
        console.error("❌ WebSocket connection error:", error);
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log("Unsubscribed from chat topic");
      }
      if (stompClient.connected) {
        stompClient.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };
  }, [authUser]);

  // Subscribe to chat updates when selectedChat changes
  useEffect(() => {
    if (!selectedChat || !stompClientRef.current) return;

    const stompClient = stompClientRef.current;

    if (stompClient.connected) {
      subscribeToChat();
    } else {
      // Wait for connection
      const checkConnection = setInterval(() => {
        if (stompClient.connected) {
          subscribeToChat();
          clearInterval(checkConnection);
        }
      }, 100);

      return () => clearInterval(checkConnection);
    }

    function subscribeToChat() {
      // Unsubscribe from previous chat
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      const topic = `/topic/chat/${selectedChat!.id}`;
      console.log(`📡 Subscribing to: ${topic}`);

      subscriptionRef.current = stompClient.subscribe(topic, (message: any) => {
        try {
          const newMessage = JSON.parse(message.body);
          console.log("📨 New message received:", newMessage);
          
          // Add message with generated ID if missing
          const messageWithId = {
            ...newMessage,
            id: newMessage.id || `msg-${Date.now()}-${Math.random()}`
          };
          
          setMessages(prev => {
            // Prevent duplicates
            const exists = prev.some(m => 
              m.id === messageWithId.id || 
              (m.content === messageWithId.content && 
               Math.abs(new Date(m.timestamp).getTime() - new Date(messageWithId.timestamp).getTime()) < 1000)
            );
            
            if (exists) return prev;
            return [...prev, messageWithId];
          });
          
          // Update last message in chat list
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === selectedChat!.id 
                ? { 
                    ...chat, 
                    lastMessage: newMessage.content, 
                    lastMsgTime: newMessage.timestamp 
                  }
                : chat
            )
          );
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [selectedChat]);

  const waitForConnection = (client, callback) => {
  const interval = setInterval(() => {
    if (client.connected) {
      clearInterval(interval);
      callback();
    }
  }, 100);
};


  // Handle chatId from URL
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === chatId);
      if (chat && chat.id !== selectedChat?.id) {
        handleChatSelection(chat);
      }
    }
  }, [chatId, chats]);

  // Handle initial user selection from URL params
  useEffect(() => {
    if (appliedUserId && campaignId && chats.length > 0) {
      handleInitialChatSelection();
    }
  }, [appliedUserId, campaignId, chats]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/getChats/${authUser?.id}`, { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("📋 Fetched chats:", data);
        setChats(data);
      } else {
        console.error("Failed to fetch chats:", response.status);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialChatSelection = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/getChat/${appliedUserId}/${campaignId}`, 
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const chat = await response.json();
        setSelectedChat(chat);
        setMessages(chat.messageList || []);
        navigate(`/messages/${chat.id}`);
      }
    } catch (error) {
      console.error('Error fetching initial chat:', error);
    }
  };

  const handleChatSelection = async (chat: Chat) => {
    console.log("🔄 Selecting chat:", chat.id);
    setSelectedChat(chat);
    setLoadingMessages(true);
    
    // Navigate to the chat URL
    navigate(`/messages/${chat.id}`);
    
    try {
      // Fetch fresh messages
      const response = await fetch(
        `http://localhost:8080/getChat/${chat.id}`, 
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const fetchedMessages = await response.json();
        console.log("💬 Fetched messages:", fetchedMessages);
        
        // Ensure all messages have IDs
        const messagesWithIds = fetchedMessages.map((msg: Message, index: number) => ({
          ...msg,
          id: msg.id || `msg-${Date.now()}-${index}`
        }));
        
        setMessages(messagesWithIds);
        
        // Mark messages as read
        // setChats(prevChats =>
        //   prevChats.map(c =>
        //     c.id === chat.id ? { ...c, unReadMsgsCount: 0 } : c
        //   )
        // );
      } else {
        console.error("Failed to fetch messages:", response.status);
        // Fallback to cached messages
        setMessages(chat.messageList || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages(chat.messageList || []);
    } finally {
      setLoadingMessages(false);
    }
  };

const handleSendMessage = async (content: string) => {
  if (!content.trim() || !selectedChat) return;

  const message = {
    sender: { 
      id: authUser?.id || '', 
      name: authUser?.name || '' 
    },
    receiver: isBrandView(selectedChat) 
      ? selectedChat.influencer 
      : selectedChat.brand,
    content: content.trim(),
    timestamp: new Date().toISOString(),
    isReadBy: false
  };

  console.log("📤 Sending message:", message);

  const client = stompClientRef.current;

  if (!client) {
    console.error("❌ STOMP client missing");
    return;
  }

  waitForConnection(client, () => {
    client.send(
      `/app/chat/${selectedChat.id}`,
      {},
      JSON.stringify(message)
    );
    console.log("✅ Message SENT after waiting for connection");
  });
};


  const handleApproveChat = async () => {
    if (!selectedChat) return;

    try {
      const response = await fetch(
        `http://localhost:8080/approveChat/${selectedChat.id}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (response.ok) {
        console.log("✅ Chat approved");
        setSelectedChat({ ...selectedChat, status: 'Approved' });
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === selectedChat.id ? { ...chat, status: 'Approved' } : chat
          )
        );
      }
    } catch (error) {
      console.error('Error approving chat:', error);
    }
  };

  const handleRejectChat = async () => {
    if (!selectedChat) return;

    try {
      const response = await fetch(
        `http://localhost:8080/rejectChat/${selectedChat.id}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (response.ok) {
        console.log("❌ Chat rejected");
        setSelectedChat({ ...selectedChat, status: 'Rejected' });
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === selectedChat.id ? { ...chat, status: 'Rejected' } : chat
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting chat:', error);
    }
  };

  const isBrandView = (chat: Chat) => {
    return authUser?.id === chat.brand.id;
  };

  const getOtherUser = (chat: Chat) => {
    return isBrandView(chat) ? chat.influencer : chat.brand;
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="messages-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-layout">
        {/* Chats Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredChats.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredChats.map(chat => {
                const otherUser = getOtherUser(chat);
                const isActive = selectedChat?.id === chat.id;
                
                return (
                  <div
                    key={chat.id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleChatSelection(chat)}
                  >
                    <div className="conversation-avatar">
                      <div className="avatar-placeholder">
                        {otherUser.name?.charAt(0).toUpperCase()}
                      </div>
                      {chat.status === 'Pending' && (
                        <span className="status-badge pending">
                          <Clock size={12} />
                        </span>
                      )}
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="conversation-name">{otherUser.name}</span>
                        <span className="conversation-time">
                          {chat.lastMsgTime 
                            ? new Date(chat.lastMsgTime).toLocaleDateString()
                            : new Date(chat.createdAt).toLocaleDateString()
                          }
                        </span>
                      </div>
                      <p className="conversation-preview">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>

                    {chat.unReadMsgsCount > 0 && (
                      <span className="unread-badge">{chat.unReadMsgsCount}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area Component */}
        <ChatArea
          selectedChat={selectedChat}
          messages={messages}
          loadingMessages={loadingMessages}
          onSendMessage={handleSendMessage}
          onApproveChat={handleApproveChat}
          onRejectChat={handleRejectChat}
          stompClientRef={stompClientRef}
        />
      </div>
    </div>
  );
};

export default Messages;