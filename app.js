// app.js

const express = require('express');
const path = require('path');
const axios = require('axios');    // <<< aqui

const app = express();

// Configuração do EJS e da pasta pública
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/home', (req, res) => {
  res.render('pages/index', {
    title: 'Home',
    bodyClass: 'home-page',
  })
});

// Rota /cursos (inicial)
app.get('/cursos', (req, res) => {
  res.render('pages/HomeCurso', {
    title: 'Cursos',
    bodyClass: 'cursos-page',
    search: '',
    cursos: [],
    errorMessage: ''
  });
});

// Rota de busca usando axios
app.get('/cursos/buscar', async (req, res) => {
  const raw = req.query.search || '';
  const term = raw.trim().toLowerCase();

  console.log('Buscando cursos com termo:', term);

  try {
    const apiUrl = `https://ingresso.ifrs.edu.br/prematricula/ws/listarCursosIW20242.php`;

    // Chamada com axios
    const response = await axios.get(apiUrl);
    const cursosAPI = response.data;
    console.log(`Recebidos ${cursosAPI.length} cursos da API.`);

    // Filtro global
    const cursosFiltrados = cursosAPI
      .filter(curso => {
        const nf = (s) => (s || '').toString().toLowerCase();
        return (
          nf(curso.id).includes(term) ||
          nf(curso.nome).includes(term) ||
          nf(curso.modalidade).includes(term) ||
          nf(curso.semestre).includes(term) ||
          nf(curso.turno).includes(term) ||
          nf(curso.unidade?.nomeCampus).includes(term)
        );
      })
      .map(curso => ({
        id: curso.id,
        nome: curso.nome,
        modalidade: curso.modalidade,
        semestre: curso.semestre,
        turno: curso.turno,
        unidade: curso.unidade?.nomeCampus || ''
      }));

    console.log(`Após filtro: ${cursosFiltrados.length} cursos.`);
    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search: raw,
      cursos: cursosFiltrados,
      errorMessage: ''
    });

  } catch (err) {
    console.error('Erro na busca de cursos:', err.message);
    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search: raw,
      cursos: [],
      errorMessage: 'Erro ao buscar cursos. Tente novamente mais tarde.'
    });
  }
});

// Outras rotas…
app.get('/cursos/novo',   (req, res) => res.render('pages/InserirCurso',   { title: 'Inserir Curso',   bodyClass: 'cursos-page' }));
app.get('/cursos/atualizar',(req, res) => res.render('pages/AtualizarCurso',{ title: 'Atualizar Curso', bodyClass: 'cursos-page' }));
app.get('/cursos/excluir',(req, res) => res.render('pages/ExcluirCurso',  { title: 'Excluir Curso',   bodyClass: 'cursos-page' }));

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
