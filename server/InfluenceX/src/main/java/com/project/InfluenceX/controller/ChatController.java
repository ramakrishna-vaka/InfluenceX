package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.*;
import com.project.InfluenceX.service.ChatService;
import com.project.InfluenceX.service.MessageService;
import com.project.InfluenceX.service.PostsService;
import com.project.InfluenceX.service.UserService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ChatController {

    private final MessageService messageService;
    private final ChatService chatService;
    private final UserService userService;
    private final PostsService postsService;

    public ChatController(MessageService messageService, ChatService chatService,
                          UserService userService, PostsService postsService) {
        this.messageService = messageService;
        this.chatService = chatService;
        this.userService = userService;
        this.postsService = postsService;
    }

    // WebSocket endpoint for sending messages
    @MessageMapping("/chat/{chatId}")
    @SendTo("/topic/chat/{chatId}")
    public Message sendToChat(@DestinationVariable Long chatId, Message message) {
        return messageService.sendToChat(chatId, message);
    }

    // Get or create chat between influencer and brand for a campaign
    @GetMapping("/getChat/{chatId}")
    @ResponseBody
    public List<Message> getChat(
            @PathVariable Long chatId) {
        return chatService.getChat(chatId);
    }

    // Get all chats for a user
    @GetMapping("/getChats/{userId}")
    @ResponseBody
    public List<ChatResponseDTO> getChats(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return chatService.getChatsByUser(user);
    }

    // Approve a chat (brand accepts influencer's pitch)
    @PostMapping("/approveChat/{chatId}")
    @ResponseBody
    public ChatResponseDTO approveChat(@PathVariable Long chatId) {
        Chat chat = chatService.approveChat(chatId);
        return chatService.convertToChatResponseDTO(chat);
    }

    // Reject a chat (brand declines influencer's pitch)
    @PostMapping("/rejectChat/{chatId}")
    @ResponseBody
    public ChatResponseDTO rejectChat(@PathVariable Long chatId) {
        Chat chat = chatService.rejectChat(chatId);
        return chatService.convertToChatResponseDTO(chat);
    }
}