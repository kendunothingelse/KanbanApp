package org.example.be.controller;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BurndownDto.BurndownResponse;
import org.example.be.service.BurndownService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BurndownController {

    private final BurndownService burndownService;

    @GetMapping("/{boardId}/burndown")
    public BurndownResponse getBurndownData(@PathVariable Long boardId) {
        return burndownService.getBurndownData(boardId);
    }

    @PostMapping("/{boardId}/snapshot/refresh")
    public void refreshTodaySnapshot(@PathVariable Long boardId) {
        burndownService.updateTodaySnapshot(boardId);
    }
}