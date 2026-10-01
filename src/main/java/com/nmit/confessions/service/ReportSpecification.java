package com.nmit.confessions.service;

import com.nmit.confessions.entity.Report;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportReason;
import com.nmit.confessions.enums.ReportStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ReportSpecification {

    public static Specification<Report> filterBy(
            ReportStatus status,
            ReportReason reason,
            ConfessionStatus confessionStatus,
            Instant fromInstant,
            Instant toInstant) {
        
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (reason != null) {
                predicates.add(cb.equal(root.get("reason"), reason));
            }

            if (confessionStatus != null) {
                // Fetch confession status
                predicates.add(cb.equal(root.join("confession", JoinType.INNER).get("status"), confessionStatus));
            } else {
                // For preventing N+1 implicitly in Specification, but it's better to fetch if returning page.
                // Spring Data will do a count query which doesn't support fetches well sometimes, 
                // but for pagination we can let entity graph or default lazy loading handle it.
                // However, doing an explicit join is fine if filtering on it.
            }

            if (fromInstant != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromInstant));
            }

            if (toInstant != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), toInstant));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
