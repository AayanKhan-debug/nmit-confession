package com.nmit.confessions.service;

import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ModerationSpecification {

    public static Specification<Confession> filterBy(
            ConfessionStatus status,
            ConfessionCategory category,
            ScreeningFlag flag,
            Instant fromInstant,
            Instant toInstant) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (flag != null) {
                // Since screeningFlags is an ElementCollection (Set<ScreeningFlag>), we join it
                predicates.add(cb.isMember(flag, root.get("screeningFlags")));
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
