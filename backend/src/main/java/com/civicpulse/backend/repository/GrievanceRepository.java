package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.Grievance;
import com.civicpulse.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByUserOrderByCreatedAtDesc(User user);
    List<Grievance> findAllByOrderByCreatedAtDesc();
    List<Grievance> findByOfficerOrderByCreatedAtDesc(User officer);
    long countByUser(User user);
    long countByUserAndStatus(User user, String status);
}