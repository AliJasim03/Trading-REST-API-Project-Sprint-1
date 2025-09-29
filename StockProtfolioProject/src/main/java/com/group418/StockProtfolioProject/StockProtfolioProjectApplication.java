package com.group418.StockProtfolioProject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StockProtfolioProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(StockProtfolioProjectApplication.class, args);
	}

}
