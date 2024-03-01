const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const port = 3000;

app.get('/convert', async (req, res) => {
  // Extrai os parâmetros da query string
  const { fileName, uc_id, nome, codigo, data } = req.query;

  if (!fileName || !uc_id || !nome || !codigo || !data) {
    return res.status(400).send('Todos os parâmetros (fileName, uc_id, nome, codigo, data) são obrigatórios');
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
   
  const page = await browser.newPage();

  // Codifica os componentes da URL
  const nomeEncoded = encodeURIComponent(nome);
  const codigoEncoded = encodeURIComponent(codigo);
  const dataEncoded = encodeURIComponent(data);

  // Monta a URL com os parâmetros
  const url = `https://othon.bubbleapps.io/version-test/certificado_teste/?nome=${nomeEncoded}&codigo=${codigoEncoded}&data=${dataEncoded}`;

  await page.goto(url, { waitUntil: 'networkidle2' });

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

  const form = new FormData();
  form.append('file', pdfBuffer, fileName);
  form.append('uc_id', uc_id);
  form.append('file_name', fileName);

  try {
    const response = await axios.post('https://al.ciparoni.com/webhook-test/20d6765d-4e35-4c70-a650-6528d1a51b10', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar a solicitação');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
