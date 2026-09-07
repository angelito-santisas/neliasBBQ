package com.neliasbbq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class NeliaBbqApplication {
    public static void main(String[] args) {
        SpringApplication.run(NeliaBbqApplication.class, args);
    }
}
