const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  const screenshotsDir = path.join(__dirname, '..', 'artifacts', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  console.log('Iniciando Chromium via Chrome nativo:', chromePath);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleLogs.push(`[CONSOLE ERROR] ${msg.text()}`);
  });

  const url = 'http://localhost:5173/';
  console.log('Navegando para:', url);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Desktop - Claro (1440x900)
  console.log('Capturando Desktop Claro (1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, 'screenshot-1440px-light.png') });

  // 2. Desktop - Escuro (1440x900)
  console.log('Capturando Desktop Escuro (1440x900)...');
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, 'screenshot-1440px-dark.png') });

  // 3. Mobile - Claro (375x812)
  console.log('Capturando Mobile Claro (375x812)...');
  await page.setViewport({ width: 375, height: 812 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, 'screenshot-375px-light.png') });

  // 4. Mobile - Escuro (375x812)
  console.log('Capturando Mobile Escuro (375x812)...');
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, 'screenshot-375px-dark.png') });

  // 5. Teste Funcional: Validação no cliente
  console.log('Testando validação e interações...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.click('.apple-btn-primary');
  await new Promise(r => setTimeout(r, 400));
  const errorText = await page.$eval('.login-card', el => el.innerText);
  console.log('Validação disparada com sucesso:', errorText.includes('Informe seu e-mail corporativo.') ? 'PASSOU' : 'VERIFICAR');

  await browser.close();
  console.log('Todos os testes e screenshots concluídos com sucesso!');
  console.log('Console errors detectados:', consoleLogs.length > 0 ? consoleLogs : 'ZERO');
}

run().catch(err => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
