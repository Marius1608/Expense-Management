package com.expensemanagement.expense_tracker.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogDTO {
    private Long id;
    private String username;
    private String action;
    private String actionDetails;
    private LocalDateTime actionTimestamp;
}