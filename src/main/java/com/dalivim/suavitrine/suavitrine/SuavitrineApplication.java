package com.dalivim.suavitrine.suavitrine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;


@SpringBootApplication
@EnableJpaAuditing
public class SuavitrineApplication {

	public static void main(String[] args) {
		SpringApplication.run(SuavitrineApplication.class, args);
	}

}
