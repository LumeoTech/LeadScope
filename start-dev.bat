@echo off
echo Iniciando PostgreSQL...
set PGDATA=%USERPROFILE%\scoop\apps\postgresql\current\data
set PGLOG=%USERPROFILE%\scoop\apps\postgresql\current\pg.log
"%USERPROFILE%\scoop\apps\postgresql\current\bin\pg_ctl.exe" start -D "%PGDATA%" -l "%PGLOG%"
echo.
echo Aguardando 3 segundos...
timeout /t 3 /nobreak > nul
echo.
echo Iniciando Backend Spring Boot...
cd /d "%~dp0backend"
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=crmdb
set DB_USER=crmuser
set DB_PASSWORD=crmpassword
set JWT_SECRET=chave-secreta-desenvolvimento-crm-scanner-2025-nao-usar-em-producao
mvnw.cmd spring-boot:run
