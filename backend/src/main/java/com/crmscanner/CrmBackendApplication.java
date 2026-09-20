package com.crmscanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicação CRM + Scanner.
 *
 * @SpringBootApplication combina três anotações:
 *   - @Configuration: esta classe pode definir beans Spring
 *   - @EnableAutoConfiguration: Spring configura automaticamente o que detectar no classpath
 *   - @ComponentScan: varre o pacote raiz procurando componentes (@Service, @Repository, etc.)
 */
@SpringBootApplication
public class CrmBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrmBackendApplication.class, args);
    }
}
