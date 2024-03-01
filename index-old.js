const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.get('/convert', async (req, res) => {
  // Inicia o Puppeteer e abre uma nova página
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navega até a URL desejada
  await page.goto('https://othon.bubbleapps.io/version-test/certificado_usuario/Lorem%20ipsum...', { waitUntil: 'networkidle2' });

  // Configurações para o PDF
  const pdfOptions = {
    format: 'A4', // O formato do papel
    landscape: true, // Define o documento para o modo paisagem
    printBackground: true, // Imprime o fundo da página
    scale: 1.215,
    margin: { // Define as margens do documento
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    },
  };

  // Gera o PDF da página e retorna como um Buffer
  const pdfBuffer = await page.pdf(pdfOptions);

  // Fecha o navegador
  await browser.close();

  // Define os cabeçalhos da resposta para indicar que é um PDF
  res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
  res.setHeader('Content-Type', 'application/pdf');

  // Envia o Buffer como resposta
  res.send(pdfBuffer);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
