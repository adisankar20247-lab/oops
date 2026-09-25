package com.example.scanner.repository;

import com.example.scanner.model.BrokenLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrokenLinkRepository extends JpaRepository<BrokenLink, Long> {
    List<BrokenLink> findByScanId(Long scanId);
}
