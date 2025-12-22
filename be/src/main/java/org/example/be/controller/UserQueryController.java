package org.example.be.controller;

import lombok.RequiredArgsConstructor;
import org.example.be.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserQueryController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public List<UserSummary> search(@RequestParam("prefix") String prefix) {
        if (prefix == null || prefix.isBlank()) return List.of();
        return userRepository
                .findTop10ByUsernameStartingWithIgnoreCaseOrderByUsernameAsc(prefix)
                .stream()
                .map(u -> new UserSummary(u.getId(), u.getUsername()))
                .toList();
    }

    public record UserSummary(Long id, String username) {}
}