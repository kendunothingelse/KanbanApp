package org.example.be.controller;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BurndownDto. BurndownResponse;
import org. example.be.service.BurndownService;
import org. springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BurndownController {

    private final BurndownService burndownService;

    /**
     * API lấy dữ liệu Burndown Chart và Velocity cho board
     * GET /boards/{boardId}/burndown
     */
    @GetMapping("/{boardId}/burndown")
    public BurndownResponse getBurndownData(@PathVariable Long boardId) {
        return burndownService.getBurndownData(boardId);
    }

    /**
     * API cập nhật snapshot cho ngày hiện tại (gọi sau khi có thay đổi task)
     * POST /boards/{boardId}/snapshot/refresh
     */
    @PostMapping("/{boardId}/snapshot/refresh")
    public void refreshTodaySnapshot(@PathVariable Long boardId) {
        burndownService.updateTodaySnapshot(boardId);
    }
}