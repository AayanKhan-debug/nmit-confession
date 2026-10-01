package com.nmit.confessions.repository;

import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;

public interface ConfessionRepository extends JpaRepository<Confession, Long>, JpaSpecificationExecutor<Confession> {
    
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

    @Query("SELECT c FROM Confession c WHERE c.status = :status AND c.createdAt >= :start AND c.createdAt < :end")
    Page<Confession> findByStatusAndDateRange(
            @Param("status") ConfessionStatus status, 
            @Param("start") java.time.Instant start, 
            @Param("end") java.time.Instant end, 
            Pageable pageable);

    @Query("SELECT c FROM Confession c WHERE c.status = :status AND c.category = :category AND c.createdAt >= :start AND c.createdAt < :end")
    Page<Confession> findByStatusAndCategoryAndDateRange(
            @Param("status") ConfessionStatus status, 
            @Param("category") ConfessionCategory category, 
            @Param("start") java.time.Instant start, 
            @Param("end") java.time.Instant end, 
            Pageable pageable);

    @Query("SELECT c FROM Confession c WHERE c.status = 'PUBLISHED' AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\')")
    Page<Confession> searchPublishedConfessions(@Param("query") String query, Pageable pageable);

    @Query("SELECT c FROM Confession c WHERE c.status = 'PUBLISHED' AND c.category = :category AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\')")
    Page<Confession> searchPublishedConfessionsByCategory(@Param("query") String query, @Param("category") ConfessionCategory category, Pageable pageable);

    @Query("SELECT c FROM Confession c WHERE c.status = 'PUBLISHED' AND c.publishedAt >= :start AND c.publishedAt <= :now ORDER BY (c.reactionLoveCount + c.reactionFunnyCount + c.reactionSadCount + c.reactionFireCount) DESC, c.publishedAt DESC, c.id DESC")
    Page<Confession> findTrendingConfessions(@Param("start") java.time.Instant start, @Param("now") java.time.Instant now, Pageable pageable);

    @Query("SELECT c FROM Confession c WHERE c.status = 'PUBLISHED' AND c.category = :category AND c.publishedAt >= :start AND c.publishedAt <= :now ORDER BY (c.reactionLoveCount + c.reactionFunnyCount + c.reactionSadCount + c.reactionFireCount) DESC, c.publishedAt DESC, c.id DESC")
    Page<Confession> findTrendingConfessionsByCategory(@Param("category") ConfessionCategory category, @Param("start") java.time.Instant start, @Param("now") java.time.Instant now, Pageable pageable);

    @Query("SELECT c.id FROM Confession c WHERE c.createdAt < :startOfDay")
    java.util.List<Long> findCandidateIdsForDaily(@Param("startOfDay") java.time.Instant startOfDay);

    java.util.Optional<Confession> findByIdAndStatus(Long id, ConfessionStatus status);

    long countByStatus(ConfessionStatus status);

    @Query("SELECT COUNT(c) FROM Confession c WHERE c.status = :status AND SIZE(c.screeningFlags) > 0")
    long countByStatusAndScreeningFlagsIsNotEmpty(@Param("status") ConfessionStatus status);

    @Query("SELECT f, COUNT(c) FROM Confession c JOIN c.screeningFlags f WHERE c.status = :status GROUP BY f")
    java.util.List<Object[]> countScreeningFlagsByStatus(@Param("status") ConfessionStatus status);

    @Query("SELECT c.category, COUNT(c) FROM Confession c WHERE c.status = :status GROUP BY c.category")
    java.util.List<Object[]> countByCategoryAndStatus(@Param("status") ConfessionStatus status);
}
