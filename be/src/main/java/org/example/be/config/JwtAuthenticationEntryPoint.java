package org.example.be.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> data = new HashMap<>();
        data.put("status", 401);
        data.put("error", "Unauthorized");
        data.put("message", "Token đã hết hạn hoặc không hợp lệ.  Vui lòng đăng nhập lại.");
        data.put("path", request.getRequestURI());

        response.getWriter().write(new ObjectMapper().writeValueAsString(data));
    }
}