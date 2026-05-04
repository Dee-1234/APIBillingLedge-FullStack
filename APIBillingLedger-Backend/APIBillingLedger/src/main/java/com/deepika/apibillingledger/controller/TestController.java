package com.deepika.apibillingledger.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/me")
    public ResponseEntity<?> getMyDetails(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok("Successfully authenticated as: " + userDetails.getUsername());
    }
}