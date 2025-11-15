import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Eye, CheckCircle, XCircle, 
  AlertCircle, MoreVertical, Paperclip,
  Smile, Clock
} from 'lucide-react';
import { useAuth } from '../../AuthProvider';
import '../css/ChatArea.css';

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

interface ChatAreaProps {
  selectedChat: Chat | null;
  messages: Message[];
  loadingMessages: boolean;
  onSendMessage: (content: string) => void;
  onApproveChat: () => void;
  onRejectChat: () => void;
  stompClientRef: React.MutableRefObject<any>;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedChat,
  messages,
  loadingMessages,
  onSendMessage,
  onApproveChat,
  onRejectChat,
  stompClientRef
}) => {

  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when chat is selected
    if (selectedChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    
    onSendMessage(messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/influencer/${userId}`);
  };

  const isBrandView = (chat: Chat) => {
    return authUser?.id === chat.brand.id;
  };

  const canSendMessage = (chat: Chat) => {
    if (isBrandView(chat)) return true;
    return chat.status === 'Approved';
  };

  const getOtherUser = (chat: Chat) => {
    return isBrandView(chat) ? chat.influencer : chat.brand;
  };

  const isMessageSent = (message: Message) => {
    // Check if the message sender ID matches the current user ID
    return message.sender.id === authUser?.id;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  if (!selectedChat) {
    return (
      <div className="chat-area-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="40" fill="#EEF2FF" />
              <path d="M45 50C45 47.7909 46.7909 46 49 46H71C73.2091 46 75 47.7909 75 50V65C75 67.2091 73.2091 69 71 69H54L45 75V50Z" fill="#6366F1" />
              <circle cx="55" cy="57" r="2" fill="white" />
              <circle cx="65" cy="57" r="2" fill="white" />
            </svg>
          </div>
          <h3>No conversation selected</h3>
          <p>Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-area-container">
      {/* Enhanced Chat Header */}
      <div className="chat-area-header">
        <div className="header-left">
          <div className="user-avatar-wrapper">
            <div className="user-avatar">
              {getOtherUser(selectedChat).name.charAt(0).toUpperCase()}
            </div>
            <span className="online-indicator"></span>
          </div>
          <div className="user-details">
            <h3>{getOtherUser(selectedChat).name}</h3>
            <div className="status-row">
              <span className={`status-badge status-${selectedChat.status.toLowerCase()}`}>
                {selectedChat.status}
              </span>
              {isTyping && (
                <span className="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="action-btn btn-view"
            onClick={() => {
              const otherUserId = getOtherUser(selectedChat).id;
              if (otherUserId !== undefined) {
                handleViewProfile(String(otherUserId));
              }
            }}
            title="View Profile"
          >
            <Eye size={18} />
            <span>Profile</span>
          </button>
          <button className="action-btn btn-more" title="More options">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Approval Banner */}
      {isBrandView(selectedChat) && selectedChat.status === 'Pending' && (
        <div className="approval-section">
          <div className="approval-content">
            <div className="approval-icon">
              <AlertCircle size={24} />
            </div>
            <div className="approval-text">
              <h4>New Collaboration Request</h4>
              <p>{getOtherUser(selectedChat).name} wants to work with you on this campaign</p>
            </div>
          </div>
          <div className="approval-buttons">
            <button className="btn-accept" onClick={onApproveChat}>
              <CheckCircle size={18} />
              Accept & Start Chat
            </button>
            <button className="btn-decline" onClick={onRejectChat}>
              <XCircle size={18} />
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Status Banners for Influencers */}
      {!isBrandView(selectedChat) && selectedChat.status === 'Pending' && (
        <div className="info-banner banner-pending">
          <Clock size={18} />
          <span>Awaiting brand approval to continue conversation</span>
        </div>
      )}

      {selectedChat.status === 'Rejected' && (
        <div className="info-banner banner-rejected">
          <XCircle size={18} />
          <span>This collaboration request was declined</span>
        </div>
      )}

      {/* Messages Area */}
      <div className="messages-viewport">
        {loadingMessages ? (
          <div className="loading-messages">
            <div className="loader"></div>
            <p>Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <h4>Start the conversation</h4>
            <p>Send a message to get things rolling</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="message-group">
              <div className="date-divider">
                <span>{new Date(date).toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              {msgs.map((message, index) => {
                const isSent = isMessageSent(message);
                const showAvatar = index === 0 || 
                  msgs[index - 1].sender.id !== message.sender.id;
                
                return (
                  <div
                    key={message.id || `${message.timestamp}-${index}`}
                    className={`message-wrapper ${isSent ? 'sent' : 'received'}`}
                  >
                    {!isSent && showAvatar && (
                      <div className="message-avatar">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!isSent && !showAvatar && <div className="message-avatar-spacer" />}
                    
                    <div className={`message-bubble ${isSent ? 'bubble-sent' : 'bubble-received'}`}>
                      {!isSent && showAvatar && (
                        <div className="sender-name">{message.sender.name}</div>
                      )}
                      <div className="message-text">{message.content}</div>
                      <div className="message-meta">
                        <span className="message-timestamp">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {isSent && (
                          <span className="message-status">
                            {message.isReadBy ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="message-composer">
        {canSendMessage(selectedChat) ? (
          <>
            <div className="composer-wrapper">
              <button className="composer-icon-btn" title="Attach file">
                <Paperclip size={20} />
              </button>
              
              <div className="composer-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className="composer-input"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <button className="composer-icon-btn" title="Add emoji">
                <Smile size={20} />
              </button>
              
              <button
                className={`composer-send-btn ${messageText.trim() ? 'active' : ''}`}
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
            
            <div className="composer-footer">
              <span className="composer-hint">
                Press Enter to send, Shift + Enter for new line
              </span>
            </div>
          </>
        ) : (
          <div className="composer-disabled">
            <AlertCircle size={20} />
            <span>
              {selectedChat.status === 'Rejected'
                ? 'This collaboration request was declined'
                : 'Waiting for brand approval to send messages'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;