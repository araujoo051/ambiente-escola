// Variáveis 
const express = require('express');
const path = require('path');

const app = express();

// Configurando a Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));


// Definir link das páginas
app.get('/', (req, res) => {
  res.render('pages/index', { 
    title: 'Home',
    bodyClass: 'home-page'
   });
});


// Rodar o server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});