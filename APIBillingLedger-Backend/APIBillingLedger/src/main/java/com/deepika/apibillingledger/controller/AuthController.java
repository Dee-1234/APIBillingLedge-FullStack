package com.deepika.apibillingledger.controller;

import com.deepika.apibillingledger.dto.JwtResponse;
import com.deepika.apibillingledger.dto.LoginRequest;
import com.deepika.apibillingledger.dto.SignupRequest;
import com.deepika.apibillingledger.model.PlanType;
import com.deepika.apibillingledger.model.Role;
import com.deepika.apibillingledger.model.User;
import com.deepika.apibillingledger.repository.UserRepository;
import com.deepika.apibillingledger.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already taken");
        }

        User user = new User();

        user.setUsername(request.getUsername());

        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        if (request.getPlanType() != null) {
            try {
                user.setPlanType(PlanType.valueOf(request.getPlanType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setPlanType(PlanType.FREE);
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(auth);
        String jwt = jwtService.generateToken(auth);

        // This will now resolve!
        return ResponseEntity.ok(new JwtResponse(jwt));
    }
}