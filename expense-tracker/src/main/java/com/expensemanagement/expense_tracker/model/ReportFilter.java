package com.expensemanagement.expense_tracker.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.context.annotation.FilterType;

@Entity
@Data
@Table(name = "report_filters")
public class ReportFilter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "report_id")
    private ExpenseReport report;

    @Enumerated(EnumType.STRING)
    @Column(name = "filter_type")
    private FilterType filterType;

    @Column(name = "filter_value")
    private String filterValue;
}