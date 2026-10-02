const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function capture() {
  const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  // Injetar sessão autenticada de teste com dados coerentes de demonstração
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const demoUser = {
      id: 1,
      name: 'Gabriel Castro',
      email: 'demo@lumeo.com',
      role: 'ADMIN',
      companyName: 'Lumeo'
    };
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('crm_auth_token', 'demo-token');
    localStorage.setItem('crm_user_info', JSON.stringify(demoUser));

    // Injetar dados de demonstração para a captura do preview
    const sampleLeads = [
      { id: 101, title: 'Contrato Anual Cloud', companyRazaoSocial: 'Vortx Finanças SA', value: 78000, statusName: 'Proposta Enviada', priority: 'ALTA', createdAt: new Date().toISOString() },
      { id: 102, title: 'Expansão Enterprise CRM', companyRazaoSocial: 'Logix Logística', value: 142000, statusName: 'Negociação', priority: 'ALTA', createdAt: new Date().toISOString() },
      { id: 103, title: 'Licenciamento Lumeo Pro', companyRazaoSocial: 'InovaTech Solutions', value: 36000, statusName: 'Qualificação', priority: 'MEDIA', createdAt: new Date().toISOString() },
      { id: 104, title: 'Onboarding Comercial', companyRazaoSocial: 'Grupo Alpha Seguros', value: 95000, statusName: 'Ganho / Fechado', priority: 'ALTA', createdAt: new Date().toISOString() }
    ];

    const sampleCompanies = [
      { id: 1, razaoSocial: 'Vortx Finanças SA', cidade: 'São Paulo', estado: 'SP', active: true, createdAt: new Date().toISOString() },
      { id: 2, razaoSocial: 'Logix Logística', cidade: 'Campinas', estado: 'SP', active: true, createdAt: new Date().toISOString() },
      { id: 3, razaoSocial: 'InovaTech Solutions', cidade: 'Curitiba', estado: 'PR', active: true, createdAt: new Date().toISOString() },
      { id: 4, razaoSocial: 'Grupo Alpha Seguros', cidade: 'Rio de Janeiro', estado: 'RJ', active: true, createdAt: new Date().toISOString() }
    ];

    // Mockar respostas fetch locais para api/leads e api/companies
    const origFetch = window.fetch;
    window.fetch = async (url, opts) => {
      const u = String(url);
      if (u.includes('/api/leads')) {
        return new Response(JSON.stringify({ content: sampleLeads, totalElements: 4 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.includes('/api/companies')) {
        return new Response(JSON.stringify({ content: sampleCompanies, totalElements: 4 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return origFetch(url, opts);
    };
  });

  // Recarregar com a sessão
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Dashboard Claro
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await new Promise(r => setTimeout(r, 600));
  const lightPath = path.join(outputDir, 'dashboard-preview-light.png');
  await page.screenshot({ path: lightPath });
  console.log('Dashboard Claro salvo em:', lightPath);

  // 2. Dashboard Escuro
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await new Promise(r => setTimeout(r, 600));
  const darkPath = path.join(outputDir, 'dashboard-preview-dark.png');
  await page.screenshot({ path: darkPath });
  console.log('Dashboard Escuro salvo em:', darkPath);

  await browser.close();
  console.log('Capturas de preview do Dashboard concluídas!');
}

capture().catch(err => {
  console.error('Erro ao capturar dashboard preview:', err);
  process.exit(1);
});
