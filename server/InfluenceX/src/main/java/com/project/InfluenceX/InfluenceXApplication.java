package com.project.InfluenceX;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InfluenceXApplication {

	public static void main(String[] args) {
		SpringApplication.run(InfluenceXApplication.class, args);
	}

}
