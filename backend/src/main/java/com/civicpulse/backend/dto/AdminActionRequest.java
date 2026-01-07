package com.civicpulse.backend.dto;

import lombok.Data;

@Data
public class AdminActionRequest {
    private Long officerId;
    private String priority;
}