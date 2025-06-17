// Variáveis 
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

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

app.get('/cursos', (req, res) => {
  res.render('pages/HomeCurso', {
    title: 'Cursos',
    bodyClass: 'cursos-page',
    search: '',
    cursos: [],
    errorMessage: ''
  });
});

app.get('/cursos/buscar', async (req, res) => {
  const searchRaw = req.query.search;
  const search = searchRaw.trim();

  try {
    const apiUrl = `https://ingresso.ifrs.edu.br/prematricula/ws/listarCursosIW20242.php?curso=${search}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Erro ao buscar cursos: ${response.statusText}`);
    }
    // Verifica se a resposta é um JSON válido
    const cursosAPI = await response.json();

    // Filtrar apenas os campos que você quiser usar
    const cursosFiltrados = cursosAPI.map(curso => ({
      id: curso.id,
      nome: curso.nome,
      modalidade: curso.modalidade,
      semestre: curso.semestre,
      turno: curso.turno,
    }));

    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search: search,
      cursos: cursosFiltrados,
      errorMessage: ''
    });

  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search: search,
      cursos: [],
      errorMessage: 'Nenhum curso encontrado ou erro na busca.'
    });
  }
});

  app.get('/cursos/novo', (req, res) => {
    res.render('pages/InserirCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page'
    });
  });

  app.get('/cursos/atualizar', (req, res) => {
    res.render('pages/AtualizarCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page'
    });
  });

  app.get('/cursos/excluir', (req, res) => {
    res.render('pages/ExcluirCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page'
    });
  });

  // Rodar o server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });