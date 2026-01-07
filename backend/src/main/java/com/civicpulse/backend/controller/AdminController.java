package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

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
}