const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/chamilo', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://chamilo.grenoble-inp.fr/', { waitUntil: 'networkidle2' });

    // Redirection vers CAS
    await page.type('#username', process.env.CAS_USER);
    await page.type('#password', process.env.CAS_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Navigation vers la page Chamilo
    await page.goto('https://chamilo.grenoble-inp.fr/courses/PHELMACATALOGUE/index.php?id_session=0', {
      waitUntil: 'networkidle2'
    });

    const html = await page.content();
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération de Chamilo');
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Chamilo prêt sur http://localhost:${PORT}`);
});
