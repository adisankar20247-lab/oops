package com.example.scanner.repository;

import com.example.scanner.model.SecurityHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityHeaderRepository extends JpaRepository<SecurityHeader, Long> {
    List<SecurityHeader> findByScanId(Long scanId);
}
