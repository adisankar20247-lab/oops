package com.example.scanner.repository;

import com.example.scanner.model.Scan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScanRepository extends JpaRepository<Scan, Long> {

    List<Scan> findAllByOrderByScanDateDesc();

    default Optional<Scan> findWithDetailsById(Long id) {
        return findById(id);
    }
}
