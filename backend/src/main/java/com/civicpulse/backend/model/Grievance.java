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
    private String status; // PENDING, ASSIGNED, RESOLVED
    private String priority; // LOW, MEDIUM, HIGH (New Field)
    private String imageUrl;
    private String resolutionImageUrl;
    private String location;
    private String officerMessage;
    private String feedback; // Citizen's comment
    private Integer rating;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private boolean notified;
    private String reopenReason;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user; // Citizen who reported it

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User officer; // Officer assigned (New Field)

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (priority == null) priority = "MEDIUM"; // Default priority
    }


}