package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.Grievance;
import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.GrievanceRepository;
import com.civicpulse.backend.repository.UserRepository;
import com.civicpulse.backend.service.GrievanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.civicpulse.backend.dto.AdminActionRequest;
import com.civicpulse.backend.repository.SLAConfigRepository;
import com.civicpulse.backend.model.SLAConfig;
import java.time.LocalDateTime;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/grievances")
@RequiredArgsConstructor
public class GrievanceController {

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final SLAConfigRepository slaConfigRepository;
    private static final String UPLOAD_DIR = "./uploads/";


    @Autowired
    private GrievanceService grievanceService;

    @PostMapping
    public ResponseEntity<?> createGrievance(
            @RequestParam("department") String department,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Principal principal) throws IOException {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Grievance grievance = new Grievance();
        grievance.setDepartment(department);
        grievance.setDescription(description);
        grievance.setLocation(location);
        grievance.setUser(user);

        if (image != null && !image.isEmpty()) {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, image.getBytes());
            grievance.setImageUrl(fileName);
        }

        grievanceRepository.save(grievance);
        return ResponseEntity.ok(Map.of("message", "Grievance submitted successfully"));
    }

    @GetMapping
    public ResponseEntity<?> getMyGrievances(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(grievanceRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        long total = grievanceRepository.countByUser(user);
        long solved = grievanceRepository.countByUserAndStatus(user, "RESOLVED");
        long pending = total - solved;

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", grievanceRepository.countByUser(user));
        stats.put("solved", grievanceRepository.countByUserAndStatus(user, "RESOLVED"));
        stats.put("pending", pending);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllGrievances() {
        return ResponseEntity.ok(grievanceRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/officers")
    public ResponseEntity<?> getAllOfficers() {
        return ResponseEntity.ok(userRepository.findByRole("OFFICER"));
    }


    @GetMapping("/assigned")
    public ResponseEntity<?> getAssignedGrievances(Principal principal) {
        User officer = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        return ResponseEntity.ok(grievanceRepository.findByOfficerOrderByCreatedAtDesc(officer));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateGrievanceStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));

        if ("RESOLVED".equals(status)) {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("You must upload an evidence picture to resolve this grievance.");
            }
            grievance.setResolvedAt(LocalDateTime.now());
        }

        if (file != null && !file.isEmpty()) {
            try {
                Files.createDirectories(Paths.get(UPLOAD_DIR));

                String fileName = System.currentTimeMillis() + "_RES_" + file.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, file.getBytes());

                grievance.setResolutionImageUrl(fileName);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Failed to upload evidence image.");
            }
        }

        grievance.setStatus(status);
        if (message != null && !message.isEmpty()) {
            grievance.setOfficerMessage(message);
        }

        grievanceRepository.save(grievance);
        return ResponseEntity.ok(Map.of("message", "Status updated with evidence."));
    }

    @PutMapping("/{id}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));

        if (!"RESOLVED".equals(grievance.getStatus())) {
            return ResponseEntity.badRequest().body("Grievance is not resolved yet.");
        }

        String feedback = (String) request.get("feedback");

        Object ratingObj = request.get("rating");
        Integer rating = null;
        if (ratingObj != null) {
            try {
                rating = Integer.parseInt(ratingObj.toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Invalid rating format");
            }
        }

        grievance.setFeedback(feedback);
        grievance.setRating(rating);

        grievanceRepository.save(grievance);
        return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully"));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignGrievanceSLA(
            @PathVariable Long id,
            @RequestBody AdminActionRequest request) {

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));

        if (request.getOfficerId() != null) {
            User officer = userRepository.findById(request.getOfficerId())
                    .orElseThrow(() -> new RuntimeException("Officer not found"));
            grievance.setOfficer(officer);
            grievance.setStatus("ASSIGNED");
        }

        if (request.getPriority() != null) {
            grievance.setPriority(request.getPriority());

            SLAConfig sla = slaConfigRepository.findByPriority(request.getPriority())
                    .orElse(null);

            if (sla != null) {
                grievance.setExpectedCompletionDate(LocalDateTime.now().plusHours(sla.getResolutionTimeInHours()));
            }
        }

        grievanceRepository.save(grievance);
        return ResponseEntity.ok(Map.of("message", "Grievance updated with SLA"));
    }

    @PutMapping("/{id}/notify")
    public ResponseEntity<?> notifyCitizen(@PathVariable Long id) {
        try {
            grievanceService.notifyCitizen(id);
            return ResponseEntity.ok(Map.of("message", "Citizen notified successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reopen")
    public ResponseEntity<?> reopenGrievance(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));

        if (!"RESOLVED".equals(grievance.getStatus())) {
            return ResponseEntity.badRequest().body("Only resolved grievances can be reopened.");
        }

        String reason = request.get("reason");
        grievance.setStatus("REOPENED");
        grievance.setReopenReason(reason);
        grievance.setResolvedAt(null);
        grievance.setNotified(false);
        grievance.setFeedback(null);
        grievance.setRating(null);

        grievanceRepository.save(grievance);
        return ResponseEntity.ok(Map.of("message", "Grievance reopened successfully"));
    }
    @GetMapping("/stats/location")
    public ResponseEntity<Map<String, Long>> getStatsByLocation() {
        List<Object[]> results = grievanceRepository.countGrievancesByLocation();
        Map<String, Long> stats = new HashMap<>();

        for (Object[] result : results) {
            String location = (String) result[0];
            Long count = (Long) result[1];
            stats.put(location != null ? location : "Unknown", count);
        }

        return ResponseEntity.ok(stats);
    }

}