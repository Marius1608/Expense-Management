package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.AuditLog;
import com.expensemanagement.expense_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUser(User user);
    List<AuditLog> findByActionTimestampBetween(LocalDateTime start, LocalDateTime end);
}