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


    public UserService(UserRepository userRepository)
    {
        this.userRepository = userRepository;
    }

    public User authenticateUser(String email,String password){
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder().matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public User createUser(UserDTO userDTO)
    {
        User user=userRepository.findByEmail(userDTO.getEmail());
        if(user!=null){
            System.out.println("Account already exists,Please login");
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User userCreated=new User();
        userCreated.setName(userDTO.getName());
        userCreated.setPassword(encoder.encode(userDTO.getPassword()));
        userCreated.setEmail(userDTO.getEmail());
        userRepository.save(userCreated);
        return userCreated;
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


}
