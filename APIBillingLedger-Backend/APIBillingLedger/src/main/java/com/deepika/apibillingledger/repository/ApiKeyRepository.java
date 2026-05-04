package com.deepika.apibillingledger.repository;

import com.deepika.apibillingledger.model.ApiKey;
import com.deepika.apibillingledger.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    List<ApiKey> findByUser(User user);

    @Query("SELECT a FROM ApiKey a JOIN FETCH a.user WHERE a.prefix = :prefix")
    List<ApiKey> findByPrefixWithUser(@Param("prefix") String prefix);
}