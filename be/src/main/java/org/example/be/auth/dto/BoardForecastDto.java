package org.example.be.auth.dto;

import java.time.LocalDate;

public record BoardForecastDto(
        double avgCycleDays,
        double avgActualHours,
        int totalCards,
        int doneCards,
        int remainingCards,
        double remainingTimeDays,
        double remainingEffortHours,
        LocalDate estimatedEndDate
) {}