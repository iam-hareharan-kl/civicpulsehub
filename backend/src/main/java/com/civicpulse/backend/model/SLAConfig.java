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
    private String priority;

    private int resolutionTimeInHours;
}