package com.nmit.confessions.repository;

import com.nmit.confessions.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {
    long countByConfessionId(Long confessionId);
    long countByStatus(com.nmit.confessions.enums.ReportStatus status);
}
