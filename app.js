const express = require('express');
const path = require('path');
const axios = require('axios');
let cursosMemoria = [];

const app = express();

// Configuração Geral EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Arquivos CSS, JS e Imagens
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Rota pagina inicial
app.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Home',
    bodyClass: 'home-page'
  });
});

// Rota cursos 
app.get('/cursos', async (req, res) => {
  try {
    const apiUrl = `https://ingresso.ifrs.edu.br/prematricula/ws/listarCursosIW20242.php`;
    const response = await axios.get(apiUrl);
    const cursosAPI = response.data.map(curso => ({
      id: curso.id,
      nome: curso.nome,
      modalidade: curso.modalidade,
      semestre: curso.semestre,
      turno: curso.turno,
      unidade: curso.unidade?.nomeCampus || ''
    }));

    const todosCursos = [...cursosAPI, ...cursosMemoria];
    const sucesso = req.query.sucesso || '';

    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search: '',
      cursos: todosCursos,
      errorMessage: '',
      sucesso
    });
  } catch (error) {
    console.error('Erro ao carregar cursos:', error.message);
    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search: '',
      cursos: [],
      errorMessage: 'Erro ao carregar a lista de cursos.',
      sucesso: ''
    });
  }
});

// Rota de busca (filtragem por qualquer campo)
app.get('/cursos/buscar', async (req, res) => {
  const searchRaw = req.query.search || '';
  const search = searchRaw.trim().toLowerCase();

  try {
    const apiUrl = `https://ingresso.ifrs.edu.br/prematricula/ws/listarCursosIW20242.php`;
    const response = await axios.get(apiUrl);
    const cursosAPI = response.data.map(curso => ({
      id: curso.id,
      nome: curso.nome,
      modalidade: curso.modalidade,
      semestre: curso.semestre,
      turno: curso.turno,
      unidade: curso.unidade?.nomeCampus || ''
    }));

    const todosCursos = [...cursosAPI, ...cursosMemoria];

    const cursosFiltrados = todosCursos.filter(curso =>
      curso.nome.toLowerCase().includes(search) ||
      curso.modalidade.toLowerCase().includes(search) ||
      String(curso.semestre).includes(search) ||
      curso.turno.toLowerCase().includes(search) ||
      curso.unidade.toLowerCase().includes(search)
    );

    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search,
      cursos: cursosFiltrados,
      errorMessage: cursosFiltrados.length === 0 ? `Nenhum curso encontrado para "${search}".` : '',
      sucesso: '' 
    });

  } catch (error) {
    console.error('Erro na busca:', error.message);
    res.render('pages/HomeCurso', {
      title: 'Cursos',
      bodyClass: 'cursos-page',
      search,
      cursos: [],
      errorMessage: 'Erro ao buscar os cursos.',
      sucesso: '' 
    });
  }
});

// Inserir Curso
app.get('/cursos/novo', (req, res) => {
  res.render('pages/InserirCurso', {
    title: 'Inserir Curso',
    bodyClass: 'cursos-page'
  });
});

app.post('/cursos/inserido', (req, res) => {
  const { id_curso, nome, modalidade, semestre, turno, campus } = req.body;

  const novoCurso = {
    id: id_curso,
    nome,
    modalidade,
    semestre,
    turno,
    unidade: campus
  };

  cursosMemoria.push(novoCurso);

  res.render('pages/SucessoCurso', {
    title: 'Curso Inserido',
    bodyClass: 'sucesso-page',
    nome
  });
});

// Atualizar Curso
app.get('/cursos/atualizar', (req, res) => {
  res.render('pages/AtualizarCurso', {
    title: 'Atualizar Curso',
    bodyClass: 'cursos-page'
  });
});

// Excluir Curso
app.get('/cursos/excluir', (req, res) => {
  res.render('pages/ExcluirCurso', {
    title: 'Excluir Curso',
    bodyClass: 'cursos-page'
  });
});

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});
