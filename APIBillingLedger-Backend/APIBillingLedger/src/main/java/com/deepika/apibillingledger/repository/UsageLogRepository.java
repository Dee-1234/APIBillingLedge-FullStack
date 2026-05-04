package com.deepika.apibillingledger.repository;

import com.deepika.apibillingledger.model.UsageLog;
import com.deepika.apibillingledger.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UsageLogRepository extends JpaRepository<UsageLog, Long>{

    List<UsageLog>findByUser(User user);

    long countByUser(User user);

    @Query("SELECT FUNCTION('DATE', l.timestamp) as date, COUNT(l) as count " +
            "FROM UsageLog l WHERE l.user = :user " +
            "GROUP BY FUNCTION('DATE', l.timestamp)")
    List<Object[]> getUsageStatsPerDay(@Param("user") User user);

    @Query("SELECT COUNT(l) FROM UsageLog l WHERE l.user = :user AND l.timestamp >= :startDate")
    long countByUserAndTimestampAfter(@Param("user") User user, @Param("startDate") LocalDateTime startDate);

    List<UsageLog> findTop10ByUserIdOrderByTimestampDesc(Long id);

    long countByUserId(Long id);
}

