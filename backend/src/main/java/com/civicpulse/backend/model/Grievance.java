package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
public class Grievance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;
    private String description;
    private String status;
    private String priority;
    private String imageUrl;
    private String resolutionImageUrl;
    private String location;
    private String officerMessage;
    private String feedback;
    private Integer rating;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private boolean notified;
    private String reopenReason;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User officer;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (priority == null) priority = "MEDIUM";
    }


}