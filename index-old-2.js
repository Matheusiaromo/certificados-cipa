const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const port = 3000;

// Adicione isso se for usar métodos que não sejam GET
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get('/convert', async (req, res) => {
  // Extrai os parâmetros da query string
  const { fileName, uc_id } = req.query; // Aqui 'fileName' é o nome do arquivo e 'uc_id' é o identificador

  if (!fileName || !uc_id) {
    return res.status(400).send('Os parâmetros fileName e uc_id são obrigatórios');
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

  const form = new FormData();
  form.append('file', pdfBuffer, fileName); // Usando 'fileName' recebido via query string
  form.append('uc_id', uc_id);
  form.append('file_name', fileName); 

  try {
    const n8nResponse = await axios.post('https://al.ciparoni.com/webhook-test/20d6765d-4e35-4c70-a650-6528d1a51b10', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    res.json(n8nResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar a solicitação');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
