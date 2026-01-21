package com.civicpulse.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // 1. Public Endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // 2. Citizen Feedback
                        // CHANGE: Use single '*' for the ID segment, not '**'
                        .requestMatchers(HttpMethod.PUT, "/api/grievances/*/feedback").hasAnyAuthority("CITIZEN", "ROLE_CITIZEN")

                        // 3. Admin/Officer Actions
                        // CHANGE: Replaced all occurrences of '/**/' with '/*/'
                        .requestMatchers(HttpMethod.PUT, "/api/grievances/*/reopen").hasAnyAuthority("CITIZEN", "ROLE_CITIZEN")
                        .requestMatchers(HttpMethod.PUT, "/api/grievances/*/notify").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/grievances/*/status").hasAnyAuthority("ADMIN", "ROLE_ADMIN", "OFFICER", "ROLE_OFFICER")
                        .requestMatchers(HttpMethod.PUT, "/api/grievances/*/assign").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // 4. Admin & Analytics (ORDER CHANGED HERE)
                        // 🟢 FIX: This SPECIFIC rule must be FIRST
                        .requestMatchers("/api/admin/analytics/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN", "OFFICER", "ROLE_OFFICER")

                        // 🟢 THEN the GENERAL rule comes after
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        .requestMatchers("/api/sla/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        // 5. Secure everything else
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}