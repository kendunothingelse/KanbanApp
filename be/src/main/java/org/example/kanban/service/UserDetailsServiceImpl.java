package org.example.kanban.service;

import lombok.RequiredArgsConstructor;
import org.example.kanban.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var u = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return User.builder()
                .username(u.getUsername())
                .password(u.getPasswordHash())
                .roles("USER") // không dùng role Spring để phân quyền tài nguyên; chỉ để pass auth
                .build();
    }
}
