package com.civicpulse.backend.service; // CHANGE THIS to match your actual package name
import com.civicpulse.backend.model.Grievance; // Import your Grievance entity
import com.civicpulse.backend.repository.GrievanceRepository; // Import your Repository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GrievanceService {

    @Autowired
    private GrievanceRepository grievanceRepository;

    // Get all grievances
    public List<Grievance> getAllGrievances() {
        return grievanceRepository.findAll();
    }

    // Get grievance by ID
    public Optional<Grievance> getGrievanceById(Long id) {
        return grievanceRepository.findById(id);
    }

    // Save or Update a grievance
    public Grievance saveGrievance(Grievance grievance) {
        return grievanceRepository.save(grievance);
    }

    // Notifying the citizen
    public void notifyCitizen(Long id) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found with ID: " + id));

        // Set the notified flag to true
        grievance.setNotified(true);

        // Save the change to the database
        grievanceRepository.save(grievance);

        System.out.println("Citizen notified for Grievance ID: " + id);
    }
}