@echo off
echo Iniciando Backend Spring Boot...
cd /d "%~dp0backend"
call .\mvnw.cmd spring-boot:run
