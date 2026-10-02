package com.nmit.confessions.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component("reactionDataMigration")
public class ReactionDataMigration {

    private static final Logger logger = LoggerFactory.getLogger(ReactionDataMigration.class);

    private final DataSource dataSource;

    public ReactionDataMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void migrate() {
        try (Connection conn = dataSource.getConnection()) {
            if (!tableExists(conn, "reactions") || !tableExists(conn, "confessions")) {
                logger.info("Reaction data migration skipped: tables do not exist yet.");
                return;
            }

            logger.info("Checking for duplicate reactions before applying unique constraint...");

            // Find duplicate groups: same confession and voter token
            String findDuplicatesSql = "SELECT confession_id, voter_token_hash, COUNT(*) as cnt " +
                    "FROM reactions " +
                    "GROUP BY confession_id, voter_token_hash " +
                    "HAVING COUNT(*) > 1";

            List<DuplicateGroup> duplicates = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(findDuplicatesSql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    duplicates.add(new DuplicateGroup(rs.getLong("confession_id"), rs.getString("voter_token_hash")));
                }
            }

            if (duplicates.isEmpty()) {
                logger.info("No duplicate reactions found. Applying unique index if not present.");
                applyUniqueIndex(conn);
                return;
            }

            logger.warn("Found {} duplicate reaction groups. Deduplicating and adjusting cached counts...", duplicates.size());

            conn.setAutoCommit(false);
            try {
                String selectRowsSql = "SELECT id, reaction_type FROM reactions " +
                        "WHERE confession_id = ? AND voter_token_hash = ? " +
                        "ORDER BY created_at ASC, id ASC";

                String deleteRowSql = "DELETE FROM reactions WHERE id = ?";

                for (DuplicateGroup group : duplicates) {
                    List<ReactionRow> rows = new ArrayList<>();
                    try (PreparedStatement ps = conn.prepareStatement(selectRowsSql)) {
                        ps.setLong(1, group.confessionId);
                        ps.setString(2, group.voterTokenHash);
                        try (ResultSet rs = ps.executeQuery()) {
                            while (rs.next()) {
                                rows.add(new ReactionRow(rs.getLong("id"), rs.getString("reaction_type")));
                            }
                        }
                    }

                    if (rows.size() <= 1) {
                        continue;
                    }

                    // Keep index 0 (earliest valid reaction)
                    ReactionRow kept = rows.get(0);
                    logger.info("Confession {}: keeping earliest reaction id={} ({}), removing {} duplicate(s)",
                            group.confessionId, kept.id, kept.reactionType, rows.size() - 1);

                    for (int i = 1; i < rows.size(); i++) {
                        ReactionRow duplicate = rows.get(i);
                        decrementConfessionReactionCount(conn, group.confessionId, duplicate.reactionType);
                        try (PreparedStatement delPs = conn.prepareStatement(deleteRowSql)) {
                            delPs.setLong(1, duplicate.id);
                            delPs.executeUpdate();
                        }
                    }
                }

                conn.commit();
                logger.info("Reaction deduplication completed successfully.");
            } catch (Exception e) {
                conn.rollback();
                logger.error("Failed to deduplicate reactions. Rolling back transaction.", e);
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }

            applyUniqueIndex(conn);
        } catch (SQLException e) {
            logger.error("Error running ReactionDataMigration: {}", e.getMessage(), e);
        }
    }

    private void decrementConfessionReactionCount(Connection conn, Long confessionId, String reactionType) throws SQLException {
        String column;
        if ("LOVE".equalsIgnoreCase(reactionType)) {
            column = "reaction_love_count";
        } else if ("FUNNY".equalsIgnoreCase(reactionType)) {
            column = "reaction_funny_count";
        } else if ("SAD".equalsIgnoreCase(reactionType)) {
            column = "reaction_sad_count";
        } else if ("FIRE".equalsIgnoreCase(reactionType)) {
            column = "reaction_fire_count";
        } else {
            return;
        }

        String sql = "UPDATE confessions SET " + column + " = CASE WHEN " + column + " > 0 THEN " + column + " - 1 ELSE 0 END WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, confessionId);
            ps.executeUpdate();
        }
    }

    private void applyUniqueIndex(Connection conn) {
        try (PreparedStatement ps = conn.prepareStatement(
                "CREATE UNIQUE INDEX IF NOT EXISTS uk_reactions_confession_voter ON reactions (confession_id, voter_token_hash)")) {
            ps.execute();
            logger.info("Unique index uk_reactions_confession_voter applied/verified.");
        } catch (SQLException e) {
            logger.warn("Unique index notice (Hibernate ddl-auto may handle it): {}", e.getMessage());
        }
    }

    private boolean tableExists(Connection conn, String tableName) throws SQLException {
        DatabaseMetaData meta = conn.getMetaData();
        try (ResultSet rs = meta.getTables(null, null, tableName, null)) {
            if (rs.next()) return true;
        }
        try (ResultSet rs = meta.getTables(null, null, tableName.toUpperCase(), null)) {
            if (rs.next()) return true;
        }
        try (ResultSet rs = meta.getTables(null, null, tableName.toLowerCase(), null)) {
            if (rs.next()) return true;
        }
        return false;
    }

    private static class DuplicateGroup {
        final Long confessionId;
        final String voterTokenHash;
        DuplicateGroup(Long confessionId, String voterTokenHash) {
            this.confessionId = confessionId;
            this.voterTokenHash = voterTokenHash;
        }
    }

    private static class ReactionRow {
        final Long id;
        final String reactionType;
        ReactionRow(Long id, String reactionType) {
            this.id = id;
            this.reactionType = reactionType;
        }
    }
}
