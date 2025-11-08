import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Send, Check, X, Clock, User, 
  CheckCircle, XCircle, AlertCircle, Eye
} from 'lucide-react';
import { useAuth } from '../../AuthProvider';
import '../css/Messages.css';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  campaignId?: string;
  campaignTitle?: string;
  status: 'pending' | 'approved' | 'rejected';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  applicationMessage?: string;
}

const Messages: React.FC = () => {
  const { authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (initialUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.userId === initialUserId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [initialUserId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/messages/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    // Check if user can send messages (must be approved or be the brand)
    //const isBrand = selectedConversation.messages[0]?.senderId !== authUser?.id;
    const isBrand = false;
    const isApproved = selectedConversation.status === 'approved';

    if (!isBrand && !isApproved) {
      alert('You can only send messages after the brand approves your application');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      });

      if (response.ok) {
        setMessageText('');
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleApproveApplication = async (conversationId: string) => {
    try {
      await fetch(`http://localhost:8080/messages/${conversationId}/approve`, {
        method: 'POST'
      });
      fetchConversations();
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (conversationId: string) => {
    try {
      await fetch(`http://localhost:8080/messages/${conversationId}/reject`, {
        method: 'POST'
      });
      fetchConversations();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleViewProfile = (userId: string) => {
    window.location.href = `/influencer/${userId}`;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.campaignTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isBrandView = (conv: Conversation) => {
    //return conv.messages.length > 0 && conv.messages[0].senderId !== authUser?.id;
    return conv.messages.length > 0;
  };

  if (loading) {
    return (
      <div className="messages-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-layout">
        {/* Conversations Sidebar */}
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
            {filteredConversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.userAvatar ? (
                      <img src={conv.userAvatar} alt={conv.userName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {conv.userName.charAt(0)}
                      </div>
                    )}
                    {conv.status === 'pending' && (
                      <span className="status-badge pending">
                        <Clock size={12} />
                      </span>
                    )}
                    {conv.status === 'approved' && (
                      <span className="status-badge approved">
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">{conv.userName}</span>
                      <span className="conversation-time">
                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                      </span>
                    </div>
                    {conv.campaignTitle && (
                      <span className="campaign-name">{conv.campaignTitle}</span>
                    )}
                    <p className="conversation-preview">{conv.lastMessage}</p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedConversation.userAvatar ? (
                      <img src={selectedConversation.userAvatar} alt={selectedConversation.userName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {selectedConversation.userName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>{selectedConversation.userName}</h3>
                    {selectedConversation.campaignTitle && (
                      <p className="campaign-subtitle">
                        Re: {selectedConversation.campaignTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="chat-actions">
                  <button
                    className="btn-view-profile"
                    onClick={() => handleViewProfile(selectedConversation.userId)}
                  >
                    <Eye size={18} />
                    View Profile
                  </button>
                </div>
              </div>

              {/* Application Approval Banner (for brands) */}
              {isBrandView(selectedConversation) && selectedConversation.status === 'pending' && (
                <div className="approval-banner">
                  <div className="approval-info">
                    <AlertCircle size={20} />
                    <div>
                      <h4>Application Pending Review</h4>
                      {selectedConversation.applicationMessage && (
                        <p className="application-message">
                          "{selectedConversation.applicationMessage}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApproveApplication(selectedConversation.id)}
                    >
                      <CheckCircle size={18} />
                      Approve & Chat
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectApplication(selectedConversation.id)}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Status Banner for Influencers */}
              {!isBrandView(selectedConversation) && selectedConversation.status === 'pending' && (
                <div className="status-banner pending">
                  <Clock size={20} />
                  <span>Waiting for brand approval to chat</span>
                </div>
              )}

              {selectedConversation.status === 'rejected' && (
                <div className="status-banner rejected">
                  <XCircle size={20} />
                  <span>Application was not accepted</span>
                </div>
              )}

              {/* Messages */}
              <div className="messages-list">
                {selectedConversation.messages.map(message => (
                  <div
                    key={message.id}
                    //className={`message ${message.senderId === authUser?.id ? 'sent' : 'received'}`}
                    className={`message? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                {selectedConversation.status === 'approved' || isBrandView(selectedConversation) ? (
                  <div className="message-input">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      className="btn-send" 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="input-disabled">
                    <AlertCircle size={18} />
                    <span>You can send messages after the brand approves your application</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <User size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;