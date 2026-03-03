package com.project.InfluenceX.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.LocalDateTime;

@Embeddable
public class ApplicationStatus {

    @Enumerated(EnumType.STRING)
    private ApplicationStatusEnum statusEnum;

    private LocalDateTime time;

    public ApplicationStatus() {}

    public ApplicationStatus(ApplicationStatusEnum statusEnum, LocalDateTime time) {
        this.statusEnum = statusEnum;
        this.time = time;
    }

    public ApplicationStatusEnum getStatusEnum() {
        return statusEnum;
    }

    public void setStatusEnum(ApplicationStatusEnum statusEnum) {
        this.statusEnum = statusEnum;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}