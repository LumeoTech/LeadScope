import os
import sys
import time
import subprocess
from datetime import datetime

PYTHON_BIN = sys.executable
SCRIPT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agent_qualifier.py")

def run_agent():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando execução diária do Lead Qualifier Agent...")
    try:
        result = subprocess.run([PYTHON_BIN, SCRIPT_PATH], capture_output=True, text=True, check=True)
        print("Saída do Agent:")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("Erro na execução do Agent:")
        print(e.stderr)

def main():
    print("=== Cron Diário do LeadScope Agent Inicializado ===")
    print("O agente buscará 10 leads diários reais, analisará seus sites e qualificará no banco.")
    
    # Executa a primeira rodada imediatamente
    run_agent()
    
    # Loop de agendamento de 24 horas (86400 segundos)
    while True:
        # Aguarda 24 horas (ou ajustável conforme demanda)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Próxima rodada programada em 24 horas. Aguardando...")
        time.sleep(86400)
        run_agent()

if __name__ == "__main__":
    main()
