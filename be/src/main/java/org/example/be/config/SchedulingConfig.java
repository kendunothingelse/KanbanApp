package org.example.be.config;

import org.springframework.context.annotation. Configuration;
import org.springframework.scheduling. annotation.EnableScheduling;

/**
 * Cấu hình để bật tính năng Scheduled Tasks
 * Dùng cho việc tự động tạo Daily Snapshots
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}