package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import com.civicpulse.backend.repository.GrievanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        Map<String, Object> response = new HashMap<>();

        // 1. Status Stats
        Map<String, Long> statusMap = new HashMap<>();
        List<Object[]> statusCounts = grievanceRepository.countGrievancesByStatus();
        for (Object[] row : statusCounts) statusMap.put((String) row[0], (Long) row[1]);
        response.put("status", statusMap);

        // 2. Category/Department Stats
        Map<String, Long> deptMap = new HashMap<>();
        List<Object[]> deptCounts = grievanceRepository.countGrievancesByDepartment();
        for (Object[] row : deptCounts) deptMap.put((String) row[0], (Long) row[1]);
        response.put("department", deptMap);

        // 3. Zone/Location Stats
        Map<String, Long> zoneMap = new HashMap<>();
        List<Object[]> zoneCounts = grievanceRepository.countGrievancesByLocation();
        for (Object[] row : zoneCounts) zoneMap.put((String) row[0], (Long) row[1]);
        response.put("zone", zoneMap);

        // 4. SLA Stats
        long slaMet = grievanceRepository.countSlaMet();
        long slaBreached = grievanceRepository.countSlaBreached();
        response.put("sla", Map.of("Met", slaMet, "Breached", slaBreached));

        return ResponseEntity.ok(response);
    }
}