package com.project.InfluenceX.service;

import com.project.InfluenceX.model.Application;
import com.project.InfluenceX.model.Posts;
import com.project.InfluenceX.model.ResponseDTO.MyCollaborationsResponseDTO;
import com.project.InfluenceX.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MyCollaborationsService {

    private final PostsService postsService;

    public MyCollaborationsService(PostsService postsService){
        this.postsService=postsService;
    }

    public ResponseEntity<?> getMyCollaborations(User user) {

        int acceptedCount = 0;
        int settledCount = 0;
        int pendingCount = 0;
        int reviewingCount = 0;
        int rejectedCount = 0;
        int withdrawnCount = 0;
        int pendingDeliverablesCount = 0;

        List<Posts> allPosts = postsService.getPosts();
        List<MyCollaborationsResponseDTO> myCollaborations = new ArrayList<>();

        for (Posts post : allPosts) {

            if (post.getApplications() == null) continue;

            for (Application application : post.getApplications()) {

                if (application.getInfluencer() == null) continue;

                if (!application.getInfluencer().getId().equals(user.getId())) continue;

                // Add post only once
                myCollaborations.add(new MyCollaborationsResponseDTO(post.getId().toString(),post.getTitle(),application.getId().toString(), user.getName(), user.getId().toString(),application.getApplicationStatusList(), post.getDeadline()));

                // Count status
                switch (application.getStatus()) {

                    case ACCEPTED:
                        acceptedCount++;
                        break;

                    case SETTLED:
                        settledCount++;
                        break;

                    case PENDING:
                        pendingCount++;
                        break;

                    case REVIEWING:
                        reviewingCount++;
                        break;

                    case REJECTED:
                        rejectedCount++;
                        break;

                    case WITHDRAW:
                        withdrawnCount++;
                        break;

                    case PENDING_DELIVERABLES:
                        pendingDeliverablesCount++;
                        break;
                }

                break; // prevent duplicate counting for same post
            }
        }

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("posts", myCollaborations);
        response.put("counts", Map.of(
                "accepted", acceptedCount,
                "settled", settledCount,
                "pending", pendingCount,
                "reviewing", reviewingCount,
                "rejected", rejectedCount,
                "withdrawn", withdrawnCount,
                "pendingDeliverables", pendingDeliverablesCount
        ));

        return ResponseEntity.ok(response);
    }
}
