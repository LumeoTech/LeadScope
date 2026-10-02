const path = require('path');
const puppeteer = require(path.join(__dirname, '..', 'frontend', 'node_modules', 'puppeteer-core'));
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', '.gemini', 'antigravity-ide', 'brain', '2f2e44a9-2d21-47c7-bc9f-7202d5cd2469', 'screenshots-verification');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando verificação visual com Google Chrome Headless...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  // Helper para alternar tema
  async function setTheme(theme) {
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('crm_theme', t);
      localStorage.setItem('leadscope_theme', t);
    }, theme);
  }

  // 1. LOGIN VIEW - REFERÊNCIA A (KRAVIO STYLE)
  console.log('📸 1. Capturando tela de Login (Referência A - Kravio)...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Garantir que está deslogado
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // 1440px Desktop - Claro
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await setTheme('light');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login_kravio_1440px_light.png') });
  console.log('  ✓ 01_login_kravio_1440px_light.png');

  // 1440px Desktop - Escuro
  await setTheme('dark');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_login_kravio_1440px_dark.png') });
  console.log('  ✓ 02_login_kravio_1440px_dark.png');

  // 768px Tablet
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await setTheme('light');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_login_kravio_768px_light.png') });
  console.log('  ✓ 03_login_kravio_768px_light.png');

  // 375px Mobile
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_login_kravio_375px_light.png') });
  console.log('  ✓ 04_login_kravio_375px_light.png');

  // 2. EFETUAR LOGIN REAL
  console.log('🔐 2. Efetuando login para testar tela interna e Sidebar...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const demoUser = {
      id: 1,
      name: 'Gabriel Castro',
      email: 'admin@lumeo.com',
      role: 'ADMIN'
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'fake-jwt-token-for-visual-testing');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // 3. SIDEBAR EXPANDIDA (240px) - REFERÊNCIA B
  console.log('📸 3. Capturando Sidebar Expandida (240px)...');
  await page.evaluate(() => {
    localStorage.setItem('lumeo_sidebar_collapsed', 'false');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await setTheme('dark');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_sidebar_expanded_240px_dark.png') });
  console.log('  ✓ 05_sidebar_expanded_240px_dark.png');

  await setTheme('light');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_sidebar_expanded_240px_light.png') });
  console.log('  ✓ 06_sidebar_expanded_240px_light.png');

  // 4. SIDEBAR RECOLHIDA (64px) - REFERÊNCIA B (CLICKUP STYLE)
  console.log('📸 4. Capturando Sidebar Recolhida (64px trilho ClickUp)...');
  await page.evaluate(() => {
    localStorage.setItem('lumeo_sidebar_collapsed', 'true');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await setTheme('dark');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_sidebar_collapsed_64px_dark.png') });
  console.log('  ✓ 07_sidebar_collapsed_64px_dark.png');

  await setTheme('light');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_sidebar_collapsed_64px_light.png') });
  console.log('  ✓ 08_sidebar_collapsed_64px_light.png');

  // 5. MOBILE BOTTOM TAB BAR (<768px)
  console.log('📸 5. Capturando Mobile Tab Bar (375px)...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await setTheme('dark');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_mobile_tabbar_375px_dark.png') });
  console.log('  ✓ 09_mobile_tabbar_375px_dark.png');

  await setTheme('light');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_mobile_tabbar_375px_light.png') });
  console.log('  ✓ 10_mobile_tabbar_375px_light.png');

  await browser.close();
  console.log('🎉 Todas as verificações visuais foram capturadas com sucesso!');
}

run().catch(err => {
  console.error('❌ Erro na captura de screenshots:', err);
  process.exit(1);
});
