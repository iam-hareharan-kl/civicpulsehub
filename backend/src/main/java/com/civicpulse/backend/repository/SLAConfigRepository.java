package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.SLAConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SLAConfigRepository extends JpaRepository<SLAConfig, Long> {
    Optional<SLAConfig> findByPriority(String priority);
}