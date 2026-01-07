package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.SLAConfig;
import com.civicpulse.backend.repository.SLAConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sla")
@RequiredArgsConstructor
public class SLAController {

    private final SLAConfigRepository slaConfigRepository;

    @GetMapping
    public ResponseEntity<List<SLAConfig>> getSLAConfigs() {
        return ResponseEntity.ok(slaConfigRepository.findAll());
    }

    @PostMapping("/init") // Run this once to setup defaults if empty
    public ResponseEntity<?> initDefaults() {
        if (slaConfigRepository.count() == 0) {
            createConfig("HIGH", 24);
            createConfig("MEDIUM", 48);
            createConfig("LOW", 72);
            return ResponseEntity.ok("Defaults created");
        }
        return ResponseEntity.ok("Configs already exist");
    }

    @PutMapping
    public ResponseEntity<?> updateSLA(@RequestBody SLAConfig config) {
        SLAConfig existing = slaConfigRepository.findByPriority(config.getPriority())
                .orElseThrow(() -> new RuntimeException("Priority not found"));
        existing.setResolutionTimeInHours(config.getResolutionTimeInHours());
        slaConfigRepository.save(existing);
        return ResponseEntity.ok("SLA Updated");
    }

    private void createConfig(String priority, int hours) {
        SLAConfig config = new SLAConfig();
        config.setPriority(priority);
        config.setResolutionTimeInHours(hours);
        slaConfigRepository.save(config);
    }
}