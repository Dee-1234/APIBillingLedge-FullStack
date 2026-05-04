package com.deepika.apibillingledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApiBillingLedgerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiBillingLedgerApplication.class, args);
	}

}
