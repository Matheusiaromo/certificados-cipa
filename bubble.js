const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const app = express();
const port = 3000;

app.get('/convert', async (req, res) => {
  // Extrai os parâmetros da query string
  const { fileName } = req.query; // 'fileName' é o único parâmetro necessário agora

  if (!fileName) {
    return res.status(400).send('O parâmetro fileName é obrigatório');
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://othon.bubbleapps.io/version-test/certificado_usuario/Lorem%20ipsum...', { waitUntil: 'networkidle2' });

  const pdfOptions = {
    format: 'A4',
    landscape: true,
    printBackground: true,
    scale: 1.215,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    },
  };

  const pdfBuffer = await page.pdf(pdfOptions);

  await browser.close();

  // Converte o binário do PDF para Base64
  const pdfBase64 = pdfBuffer.toString('base64');

  try {
    // Envia os dados para o Bubble
    const response = await axios.post('https://othon.bubbleapps.io/version-test/api/1.1/obj/upload', {
      filename: fileName,
      contents: pdfBase64,
      private: true
      // 'attach_to' foi removido daqui
    }, {
      headers: {
        'Authorization': 'Bearer c27c1fb682de7b1733c458e766463460',
        'Content-Type': 'application/json',
      },
    });

    // Envia a resposta do Bubble como a resposta da API
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar a solicitação');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
