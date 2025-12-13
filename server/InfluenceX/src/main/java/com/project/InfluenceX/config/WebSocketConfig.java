package com.project.InfluenceX.config;

import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

//    private final JwtService jwtService;
//    private final UserService userService;
//
//    public WebSocketConfig(JwtService jwtService, UserService userService) {
//        this.jwtService = jwtService;
//        this.userService = userService;
//    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")      // endpoint to connect {client connects to this endpoint first}
                .setAllowedOrigins("http://localhost:5173")// allow all origins for now
                .withSockJS();           // for browser fallback, this is http polling
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app"); // client sends here
        registry.enableSimpleBroker("/topic", "/queue");  // server broadcasts here
    }

     //we can also queue it is right one to use here
    // queue is user specific & topic is public specific

//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        registration.interceptors(new ChannelInterceptor() {
//            @Override
//            public Message<?> preSend(Message<?> message, MessageChannel channel) {
//
//                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
//
//                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
//
//                    HttpServletRequest request =
//                            ((ServletRequestAttributes) RequestContextHolder
//                                    .getRequestAttributes())
//                                    .getRequest();
//
//                    String jwt = Arrays.stream(request.getCookies())
//                            .filter(c -> "authToken".equals(c.getName()))
//                            .map(Cookie::getValue)
//                            .findFirst()
//                            .orElse(null);
//
//                    if (jwt == null) {
//                        throw new IllegalStateException("JWT missing");
//                    }
//
//                    String email = jwtService.extractEmail(jwt);
//                    User user = userService.getUserByEmail(email); // must return String
//                    String userId=user.getId().toString();
//                    accessor.setUser(
//                            new UsernamePasswordAuthenticationToken(userId, null)
//                    );
//                }
//
//                return message;
//            }
//        });
//    }


}







