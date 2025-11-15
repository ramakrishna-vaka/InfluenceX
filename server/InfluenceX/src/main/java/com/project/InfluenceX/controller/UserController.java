package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.User;
import com.project.InfluenceX.model.UserDTO;
import com.project.InfluenceX.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {


    private UserService userService;

    public UserController(UserService userService)
    {
        this.userService=userService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    @GetMapping("/user/{userId}")
    public User getUserById(@PathVariable Long userId){
        return userService.getUserById(userId);
    }

    @PostMapping("/login/user")
    public ResponseEntity loginUser(@RequestBody UserDTO userDTO)
    {
        return userService.loginUser(userDTO);
    }

    @PostMapping("/register/user")
    public User createUser(@RequestBody UserDTO userDTO)
    {
        return userService.createUser(userDTO);
    }
}
