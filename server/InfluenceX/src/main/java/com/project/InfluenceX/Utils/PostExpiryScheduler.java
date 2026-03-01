package com.project.InfluenceX.Utils;

import com.project.InfluenceX.repository.PostsRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PostExpiryScheduler {

    private final PostsRepository postRepository;

    public PostExpiryScheduler(PostsRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Scheduled(cron = "0 */15 * * * *")
    // runs every 10 seconds @Scheduled(cron = "*/10 * * * * *")
    @Transactional
    public void expirePostsJob() {

        int count = postRepository.expirePosts();

        System.out.println("Expired {} posts" + count);
    }
}

