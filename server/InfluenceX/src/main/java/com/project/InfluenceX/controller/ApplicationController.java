package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.Application;
import com.project.InfluenceX.model.ApplicationDTO;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173",allowCredentials = "true")
public class ApplicationController {
    private ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService){
        this.applicationService=applicationService;
    }

    @PostMapping("/application/create")
    public ResponseEntity<Application> createApplication(@RequestBody ApplicationDTO applicationDTO){
        return applicationService.createApplication(applicationDTO);
    }
}
