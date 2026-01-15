package org.example.be. config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta. servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.be.service.UserDetailsServiceImpl;
import org. springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config. Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core. context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web. authentication.www.BasicAuthenticationFilter;

import java.io.IOException;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/columns/**").authenticated()
                        .requestMatchers("/cards/**").authenticated()
                        . requestMatchers("/workspaces/**").authenticated()
                        .requestMatchers("/boards/**").authenticated()
                        . requestMatchers("/users/**").authenticated()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .addFilterBefore(new JwtAuthFilter(jwtService, userDetailsService), BasicAuthenticationFilter.class)
                .authenticationProvider(daoAuthProvider());
        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userDetailsService);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // JWT Filter - Improved error handling
    static class JwtAuthFilter extends BasicAuthenticationFilter {
        private final JwtService jwtService;
        private final UserDetailsServiceImpl uds;

        public JwtAuthFilter(JwtService jwtService, UserDetailsServiceImpl uds) {
            super(authentication -> authentication);
            this.jwtService = jwtService;
            this. uds = uds;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws IOException, ServletException {

            String auth = request.getHeader("Authorization");

            if (auth != null && auth.startsWith("Bearer ")) {
                try {
                    String token = auth.substring(7);
                    String username = jwtService.extractUsername(token);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        var userDetails = uds.loadUserByUsername(username);

                        if (jwtService. validateToken(token, username)) {
                            var authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        } else {
                            // Token invalid - log và không set authentication
                            System.err.println("JWT validation failed for user: " + username);
                        }
                    }
                } catch (io.jsonwebtoken.ExpiredJwtException e) {
                    // Token hết hạn - log chi tiết
                    System.err.println("JWT expired: " + e.getMessage());
                    request.setAttribute("expired", true);
                } catch (io.jsonwebtoken.MalformedJwtException e) {
                    System.err.println("Malformed JWT: " + e. getMessage());
                } catch (io.jsonwebtoken. SignatureException e) {
                    System.err.println("Invalid JWT signature: " + e.getMessage());
                } catch (Exception e) {
                    System.err.println("JWT processing error: " + e.getMessage());
                }
            }

            chain.doFilter(request, response);
        }
    }
}