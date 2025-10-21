package com.tumorvision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TumorVisionBackendApplication {
 
	public static void main(String[] args) {
		SpringApplication.run(TumorVisionBackendApplication.class, args);
		System.out.println("----------------------------------------");
		System.out.println("        Tumor Vision is  Running        ");
		System.out.println("----------------------------------------");
	}
}
