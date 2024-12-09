package com.expensemanagement.expense_tracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.core.rolling.RollingFileAppender;
import ch.qos.logback.core.rolling.TimeBasedRollingPolicy;

@Configuration
public class LoggingConfig {

    @Bean
    public LoggerContext loggerContext() {
        LoggerContext context = new LoggerContext();

        RollingFileAppender appender = new RollingFileAppender();
        appender.setContext(context);
        appender.setFile("logs/expense-tracker.log");

        TimeBasedRollingPolicy policy = new TimeBasedRollingPolicy();
        policy.setContext(context);
        policy.setParent(appender);
        policy.setFileNamePattern("logs/expense-tracker-%d{yyyy-MM-dd}.log");
        policy.setMaxHistory(30);
        policy.start();

        PatternLayoutEncoder encoder = new PatternLayoutEncoder();
        encoder.setContext(context);
        encoder.setPattern("%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n");
        encoder.start();

        appender.setRollingPolicy(policy);
        appender.setEncoder(encoder);
        appender.start();

        return context;
    }
}