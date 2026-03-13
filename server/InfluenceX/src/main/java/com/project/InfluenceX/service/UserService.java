package com.project.InfluenceX.service;

import com.project.InfluenceX.model.User;
import com.project.InfluenceX.model.UserDTO;
import com.project.InfluenceX.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final NotificationsService notificationsService;

    public UserService(UserRepository userRepository,NotificationsService notificationsService)
    {
        this.notificationsService=notificationsService;
        this.userRepository = userRepository;
    }

    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public User createUser(UserDTO userDTO) {
        User existing = userRepository.findByEmail(userDTO.getEmail());

        if (existing != null) {
            if ("GOOGLE".equals(existing.getAuthProvider())) {
                throw new RuntimeException("This email is registered via Google. Please login with Google.");
            }
            throw new RuntimeException("Account already exists. Please login.");
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User user = new User();
        user.setName(userDTO.getName());
        user.setPassword(encoder.encode(userDTO.getPassword()));
        user.setEmail(userDTO.getEmail());
        user.setAuthProvider("LOCAL");
        user.setCreatedAt(java.time.LocalDateTime.now());
        User savedUser =userRepository.save(user);

        addRegisterBonus(savedUser);

        return savedUser;
    }

    public void addRegisterBonus(User user){
        user.setWalletMoney(50);
        user.setTotalEarnings(50);
        notificationsService.createNotification(
                user,
                "₹50 has been credited to your account as a registration bonus."
        );
    }

    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("No account found with this email.");
        }
        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new RuntimeException("This account uses Google login. Please sign in with Google.");
        }
        if (!passwordEncoder().matches(password, user.getPassword())) {
            throw new RuntimeException("Incorrect password.");
        }
        return user;
    }

    public ResponseEntity<? extends Object> loginUser(UserDTO userDTO)
    {
        String email=userDTO.getEmail();
        User user=userRepository.findByEmail(email);
        if(user!=null)
        {
            if(userDTO.getPassword().equals(user.getPassword())){
                System.out.println("Login successfull");
                return ResponseEntity.ok(user);
            }else{
                System.out.println("You entered wrong password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please enter correct password");
            }
        }else {
            System.out.println("User does not exist, create an account");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User doesn't exist, create an account");
        }
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public List<User> getUserByName(String name) {
        return userRepository.findByName(name);
    }

    public User getUserById(Long Id)
    {
        return userRepository.findById(Id)
                .orElseThrow(() -> new RuntimeException("User not found: " + Id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void registerGoogleUser(User user){
        userRepository.save(user);
    }

    // ─── Add these methods to UserService.java ────────────────────────────────────

    /**
     * Mark user's email as verified.
     * Add `emailVerified` boolean field to User entity first.
     */
//    public void markEmailVerified(String email) {
//        User user = userRepository.findByEmail(email);
//        if (user != null) {
//            user.setEmailVerified(true);
//            userRepository.save(user);
//        }
//    }

    /**
     * Reset a user's password — encodes with BCrypt.
     */
    public void resetPassword(String email, String newRawPassword) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("User not found");
        user.setPassword(passwordEncoder().encode(newRawPassword));
        userRepository.save(user);
    }


}
