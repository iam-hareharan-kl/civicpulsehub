package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.Grievance;
import com.civicpulse.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByUserOrderByCreatedAtDesc(User user);
    List<Grievance> findAllByOrderByCreatedAtDesc();
    List<Grievance> findByOfficerOrderByCreatedAtDesc(User officer);
    long countByUser(User user);
    long countByUserAndStatus(User user, String status);
    @Query("SELECT g.status, COUNT(g) FROM Grievance g GROUP BY g.status")
    List<Object[]> countGrievancesByStatus();

    // --- NEW ANALYTICS QUERIES ---

    @Query("SELECT g.department, COUNT(g) FROM Grievance g GROUP BY g.department")
    List<Object[]> countGrievancesByDepartment();

    @Query("SELECT g.location, COUNT(g) FROM Grievance g GROUP BY g.location")
    List<Object[]> countGrievancesByLocation();

    @Query("SELECT COUNT(g) FROM Grievance g WHERE g.status = 'RESOLVED' AND g.resolvedAt <= g.expectedCompletionDate")
    long countSlaMet();

    @Query("SELECT COUNT(g) FROM Grievance g WHERE (g.status = 'RESOLVED' AND g.resolvedAt > g.expectedCompletionDate) OR (g.status != 'RESOLVED' AND g.expectedCompletionDate < CURRENT_TIMESTAMP)")
    long countSlaBreached();
}