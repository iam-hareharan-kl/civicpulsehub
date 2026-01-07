package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SLAConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String priority; // HIGH, MEDIUM, LOW

    private int resolutionTimeInHours; // e.g., 24, 48, 72
}