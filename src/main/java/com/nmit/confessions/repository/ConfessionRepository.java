package com.nmit.confessions.repository;

import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.repository.query.Param;
public interface ConfessionRepository extends JpaRepository<Confession, Long> {
    
    @Query("SELECT c FROM Confession c WHERE c.status = :status ORDER BY CASE WHEN SIZE(c.screeningFlags) > 0 THEN 0 ELSE 1 END, c.createdAt DESC")
    Page<Confession> findByStatusOrderByFlagsAndDate(@Param("status") ConfessionStatus status, Pageable pageable);

    Page<Confession> findByStatus(ConfessionStatus status, Pageable pageable);

    Page<Confession> findByStatusAndCategory(ConfessionStatus status, ConfessionCategory category, Pageable pageable);

    @Modifying
    @Query("UPDATE Confession c SET c.reactionLoveCount = c.reactionLoveCount + 1 WHERE c.id = :id")
    void incrementLoveCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Confession c SET c.reactionFunnyCount = c.reactionFunnyCount + 1 WHERE c.id = :id")
    void incrementFunnyCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Confession c SET c.reactionSadCount = c.reactionSadCount + 1 WHERE c.id = :id")
    void incrementSadCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Confession c SET c.reactionFireCount = c.reactionFireCount + 1 WHERE c.id = :id")
    void incrementFireCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Confession c SET c.reportCount = c.reportCount + 1 WHERE c.id = :id")
    void incrementReportCount(@Param("id") Long id);
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Confession c SET c.status = :status WHERE c.id = :id AND c.status = 'PUBLISHED'")
    int updateStatusIfPublished(@Param("id") Long id, @Param("status") ConfessionStatus status);
}
