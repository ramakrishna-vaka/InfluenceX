package com.project.InfluenceX.service;

import com.project.InfluenceX.model.*;
import com.project.InfluenceX.model.RequestDTO.DeliverablesDTO;
import com.project.InfluenceX.repository.ApplicationRepository;
import com.project.InfluenceX.repository.PostsRepository;
import com.project.InfluenceX.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final PostsRepository postsRepository;
    private final UserRepository userRepository;
    private final NotificationsService notificationsService;
    private final ChatService chatService;
    private final PaymentService paymentService;

    @Value("${razor.pay.test.key.id}")
    private String razorpayKeyId;

    @Value("${razor.pay.test.key.secret}")
    private String razorpayKeySecret;

    public ApplicationService(ApplicationRepository applicationRepository, PostsRepository postsRepository,UserRepository userRepository,NotificationsService notificationsService,ChatService chatService, PaymentService paymentService){
        this.applicationRepository=applicationRepository;
        this.postsRepository = postsRepository;
        this.userRepository = userRepository;
        this.notificationsService=notificationsService;
        this.chatService=chatService;
        this.paymentService=paymentService;
    }

    //TODO: don't use repository of posts/user here. keep fetching logic only in their respective service
    public ResponseEntity<?> createApplication(ApplicationDTO applicationDTO){
        Long postId=applicationDTO.getPostId();
        Posts post = postsRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Long userId=applicationDTO.getInfluencerId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(applicationRepository.existsByPostIdAndInfluencerId(postId,userId)){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Application Already Exists");
        }
        Application application=new Application();
        application.setPost(post);
        User createdBy=post.getCreatedBy();


        notificationsService.createNotification(
                createdBy,
                user.getName() + " applied to your post titled \"" + post.getTitle() + "\""
        );

        chatService.createChat(createdBy,user,applicationDTO.getPitchMessage());

        application.setInfluencer(user);
        application.setAppliedAt(LocalDateTime.now());
        application.setPitchMessage(applicationDTO.getPitchMessage());
        application.setStatus(ApplicationStatusEnum.PENDING);
        applicationRepository.save(application);
        PostsService.setApplications(post,application);
        return ResponseEntity.ok(application);
    }

    public Application getApplicationById(Long applicationId){
        return applicationRepository.getReferenceById(applicationId);
    }

    public ResponseEntity<?> acceptApplication(Application application){
        if(application.getCurrentStatus().equals(ApplicationStatusEnum.PENDING)){
            application.setStatus(ApplicationStatusEnum.ACCEPTED);
            application.setStatus(ApplicationStatusEnum.IN_PROGRESS);
            notificationsService.createNotification(application.getInfluencer(),application.getPost().getCreatedBy().getName() +" accepted your application to Post "+application.getPost().getTitle());
            chatService.approveChat(chatService.getChatId(application.getPost().getCreatedBy(),application.getInfluencer()));
            return ResponseEntity.status(HttpStatus.ACCEPTED).body("Application accepted");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Application is not in pending state");
    }

    public ResponseEntity<?> rejectApplication(Application application){
        if(application.getCurrentStatus().equals(ApplicationStatusEnum.PENDING)){
            application.setStatus(ApplicationStatusEnum.REJECTED);
            notificationsService.createNotification(application.getInfluencer(),application.getPost().getCreatedBy().getName() +" rejected your application to Post "+application.getPost().getTitle());
            return ResponseEntity.status(HttpStatus.ACCEPTED).body("Application Rejected");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Application is not in pending state");
    }

    public ResponseEntity<?> withdrawApplication(Application application){
        if(application.getCurrentStatus().equals(ApplicationStatusEnum.PENDING)){
            application.setStatus(ApplicationStatusEnum.WITHDRAW);
            notificationsService.createNotification(application.getPost().getCreatedBy(),application.getInfluencer() +" withdraw their application to Post "+application.getPost().getTitle());
            return ResponseEntity.status(HttpStatus.ACCEPTED).body("Application Rejected");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Application is not in pending state");
    }

    public ResponseEntity<?> submitDeliverables(Application app,
                                   List<DeliverablesDTO> dtosIn) {

        // Replace any previous (rejected) deliverables with new ones
        app.getDeliverables().clear();
        List<Deliverable> mapped = dtosIn.stream().map(d -> {
            Deliverable del = new Deliverable();
            del.setType(d.getType());
            del.setUrl(d.getUrl());
            del.setImageUrl(d.getImageUrl());
            del.setUploadedAt(LocalDateTime.now());
            del.setApplication(app);
            return del;
        }).collect(Collectors.toList());
        app.getDeliverables().addAll(mapped);

        // Advance status → DELIVERED (brand will see "reviewing" on their side)
        app.setStatus(ApplicationStatusEnum.DELIVERABLES_SUBMITTED);
        app.setStatus(ApplicationStatusEnum.REVIEWING);
        applicationRepository.save(app);
        return ResponseEntity.ok("Deliverables submitted successfully");
    }

    public Map<String, Object> acceptDeliverablesAndCreateOrder(Application app) {

        // Mark status as PENDING_PAYMENT immediately
        app.setStatus(ApplicationStatusEnum.DELIVERABLES_ACCEPTED);
        app.setStatus(ApplicationStatusEnum.PAYMENT_PENDING);
        applicationRepository.save(app);

        // Create Razorpay order
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            int amountPaise = (int)(Integer.parseInt(app.getPost().getCompensationDescription() )* 100); // price in INR → paise

            JSONObject orderReq = new JSONObject();
            orderReq.put("amount",   amountPaise);
            orderReq.put("currency", "INR");
            orderReq.put("receipt",  "rcpt_" + app.getId());
            orderReq.put("notes", new JSONObject()
                    .put("applicationId", app.getId()));

            Order order = client.orders.create(orderReq);

            // Persist the orderId on the application so webhook can look it up
            Payment payment = new Payment();
            payment.setApplication(app);
            payment.setRazorpayOrderId(order.get("id").toString());
            payment.setAmount(amountPaise);
            payment.setCurrency("INR");

            paymentService.savePayment(payment);

            return Map.of(
                    "orderId",       order.get("id"),
                    "amount",        amountPaise,
                    "currency",      "INR",
                    "keyId",         razorpayKeyId,
                    "applicationId", app.getId()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    public ResponseEntity<?> rejectDeliverables(Application app) {
        app.setStatus(ApplicationStatusEnum.DELIVERABLES_REJECTED);
        applicationRepository.save(app);
        return ResponseEntity.ok("Rejected ");
    }

    public void reportProblem(String applicationId, String category,
                              String message, String userEmail) {
        // Persist to a support/report table — implement SupportReport entity as needed
//        SupportReport report = new SupportReport();
//        report.setApplicationId(applicationId);
//        report.setCategory(category);
//        report.setMessage(message);
//        report.setReporterEmail(userEmail);
//        report.setCreatedAt(LocalDateTime.now());
//        supportReportRepository.save(report);

    }

}
