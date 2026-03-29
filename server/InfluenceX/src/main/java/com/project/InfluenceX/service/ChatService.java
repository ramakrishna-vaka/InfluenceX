package com.project.InfluenceX.service;

import com.project.InfluenceX.model.*;
import com.project.InfluenceX.repository.ChatRepository;
import com.project.InfluenceX.repository.MessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.project.InfluenceX.Utils.ModelToDTOMapper.userToUserDTO;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private SimpMessagingTemplate messagingTemplate;
    private MessageRepository messageRepository;

    public ChatService(ChatRepository chatRepository,SimpMessagingTemplate simpMessagingTemplate,MessageRepository messageRepository) {
        this.chatRepository = chatRepository;
        this.messagingTemplate=simpMessagingTemplate;
        this.messageRepository=messageRepository;
    }

    public Chat saveMessage(Chat Chat) {
        return chatRepository.save(Chat);
    }

    public List<ChatResponseDTO> getChatsByUser(User receiver) {

        // Step 1: Get all chats where the receiver is the brand
        List<Chat> chats = chatRepository.findByBrand(receiver);
        if(chats.isEmpty()){
            chats=chatRepository.findByInfluencer(receiver);
        }
        List<ChatResponseDTO> responseList = new ArrayList<>();

        for (Chat chat : chats) {

            ChatResponseDTO dto = new ChatResponseDTO();

            // Chat ID
            dto.setId(chat.getId());

            // Step 2: Determine sender (other user)
//            User sender = chat.getInfluencer().getId().equals(receiver.getId())
//                    ? chat.getBrand()
//                    : chat.getInfluencer();

            dto.setBrand(userToUserDTO(chat.getBrand()));
            dto.setInfluencer(userToUserDTO(chat.getInfluencer()));

            // Step 3: Last message time
            LocalDateTime lastMessageTime = chat.getMessageList()
                    .stream()
                    .map(Message::getTimestamp)
                    .max(LocalDateTime::compareTo)
                    .orElse(chat.getCreatedAt());

            dto.setLastMsgTime(lastMessageTime);

            // Step 4: Count unread messages
//            int unreadCount = (int) chat.getMessageList()
//                    .stream()
//                    .filter(msg -> msg.getReceiver().getId().equals(receiver.getId()))
//                    .filter(msg -> !msg.getIsReadBy())
//                    .count();

            dto.setUnReadMsgsCount(1);

            // Step 5: Status
            dto.setStatus(chat.getStatus());

            responseList.add(dto);
        }

        return responseList;
    }


    public List<Chat> getMessagesBySender(User sender) {
        return chatRepository.findByInfluencer(sender);
    }

    public Chat getChatIdByInfluencerAndBrand(User influencer, User brand){
        return chatRepository.findByInfluencerAndBrand(influencer,brand);
    }

    public List<Chat> getAllMessages() {
        return chatRepository.findAll();
    }

    public void createChat(User brand, User influencer, String content){
        Chat chat=chatRepository.findByInfluencerAndBrand(influencer,brand);
        if(chat==null){
            chat=new Chat(brand,influencer);
            chatRepository.save(chat);
        }
        Message message=new Message(brand,influencer,content,chat);
        messageRepository.save(message);
        List<Message> messageList=chat.getMessageList();
        if(messageList==null){
            messageList=new ArrayList<>();
        }
        messageList.add(message);
        chat.setMessageList(messageList);
        chatRepository.save(chat);



        ChatResponseDTO chatResponseDTO=convertToChatResponseDTO(chat);
        // Notify BRAND
        messagingTemplate.convertAndSend(
                "/topic/chats/" + brand.getId(),
                chatResponseDTO
        );

        // Notify INFLUENCER
        messagingTemplate.convertAndSend(
                "/topic/chats/" + influencer.getId(),
                chatResponseDTO
        );
    }

    public Chat approveChat(Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        chat.setStatus("Approved");
        return chatRepository.save(chat);
    }

    public Chat rejectChat(Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        chat.setStatus("Rejected");
        return chatRepository.save(chat);
    }

    public Long getChatId(User brand, User influencer){
        Chat chat = chatRepository.findByInfluencerAndBrand(influencer,brand);
        return chat.getId();
    }

    public ChatResponseDTO convertToChatResponseDTO(Chat chat) {
        ChatResponseDTO dto = new ChatResponseDTO();
        dto.setId(chat.getId());
        dto.setStatus(chat.getStatus());
        dto.setCreatedAt(chat.getCreatedAt());

        // Convert messages
        if (chat.getMessageList() != null) {
            dto.setMessageList(
                    chat.getMessageList().stream()
                            .map(this::convertToMessageDTO)
                            .collect(Collectors.toList())
            );

            // Set last message info
            if (!chat.getMessageList().isEmpty()) {
                Message lastMsg = chat.getMessageList().get(chat.getMessageList().size() - 1);
                dto.setLastMessage(lastMsg.getContent());
                dto.setLastMsgTime(lastMsg.getTimestamp());
            }

            // Count unread messages (customize based on your logic)
            dto.setUnReadMsgsCount(
                    (int) chat.getMessageList().stream()
                            .filter(m -> !m.getIsReadBy())
                            .count()
            );
        }

        return dto;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsReadBy(message.getIsReadBy());
        dto.setSender(userToUserDTO(message.getSender()));
        dto.setReceiver(userToUserDTO(message.getReceiver()));
        return dto;
    }

    public List<Message> getChat(Long chatId){
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        return chat.getMessageList();

    }

}
