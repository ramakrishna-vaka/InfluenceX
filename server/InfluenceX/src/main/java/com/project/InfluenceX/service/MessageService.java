package com.project.InfluenceX.service;

import com.project.InfluenceX.model.Chat;
import com.project.InfluenceX.model.Message;
import com.project.InfluenceX.repository.ChatRepository;
import com.project.InfluenceX.repository.MessageRepository;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    public MessageService(MessageRepository messageRepository,ChatRepository chatRepository){
        this.messageRepository=messageRepository;
        this.chatRepository=chatRepository;
    }

    public Message sendToChat(Long chatId,Message message) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        if ("BLOCKED".equals(chat.getStatus())) {
            throw new RuntimeException("Chat is blocked by brand.");
        }
        return messageRepository.save(message);
    }
}
