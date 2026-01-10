package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import com.civicpulse.backend.repository.GrievanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final GrievanceRepository grievanceRepository;

    // 1. Get Pending Officers
    @GetMapping("/officers/pending")
    public ResponseEntity<List<User>> getPendingOfficers() {
        return ResponseEntity.ok(userRepository.findByRoleAndIsApproved("OFFICER", false));
    }

    // 2. Approve Officer & Assign Department
    @PutMapping("/officers/{id}/approve")
    public ResponseEntity<?> approveOfficer(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) { // {"department": "Roads"}

        User officer = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        officer.setApproved(true);
        officer.setDepartment(request.get("department"));

        userRepository.save(officer);
        return ResponseEntity.ok(Map.of("message", "Officer approved and assigned."));
    }

    @GetMapping("/analytics/status")
    public ResponseEntity<Map<String, Long>> getGrievanceAnalytics() {
        List<Object[]> results = grievanceRepository.countGrievancesByStatus();
        Map<String, Long> analytics = new HashMap<>();

        // Default values to ensure all keys exist
        analytics.put("PENDING", 0L);
        analytics.put("IN_PROGRESS", 0L);
        analytics.put("RESOLVED", 0L);
        analytics.put("REJECTED", 0L);

        for (Object[] result : results) {
            analytics.put((String) result[0], (Long) result[1]);
        }
        return ResponseEntity.ok(analytics);
    }
}