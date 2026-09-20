@echo off
echo =======================================================
echo LeadScope AI Lead Qualification Agent - Execucao Diaria
echo =======================================================
cd /d "%~dp0"
python agent_qualifier.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao executar agent_qualifier.py com python padrao. Tentando com py...
    py agent_qualifier.py
)
echo =======================================================
echo Concluido! Pressione qualquer tecla para sair...
pause
