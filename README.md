# 🎬 Filmes Favoritos

![Preview do Projeto](https://via.placeholder.com/1000x500.png?text=Preview+do+Projeto)  

Aplicação web que permite **buscar filmes**, **favoritar** os que você mais gosta e até **gerar um PDF** com sua lista personalizada.  
Desenvolvida com **Django (backend)** e **React + Bootstrap (frontend)**, a aplicação consome dados da **API do TMDB**.

## 🚀 Funcionalidades

- 🔍 Buscar filmes pelo nome (usando a API do TMDB)  
- ⭐ Adicionar e remover filmes dos favoritos  
- 🗂️ Visualizar e compartilhar lista de favoritos  
- 📄 Gerar um PDF com os filmes salvos  
- 🌙 Alternar entre **modo claro e escuro**  
- 🔗 Compartilhar a lista de favoritos por link  


## 🧩 Tecnologias Utilizadas

### **Backend**
- Python 3 / Django 5  
- Banco de dados SQLite  
- Biblioteca `requests`  
- Variáveis de ambiente com `.env`

### **Frontend**
- React 18  
- Axios  
- React Bootstrap  
- jsPDF (para gerar PDF)  
- CSS customizado (modo escuro e claro)

## ⚙️ Como Rodar o Projeto Localmente

### 1. Clone o repositório

git clone https://github.com/seu-usuario/filmes-favoritos.git
cd filmes-favoritos

2. Configure o backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
Crie um arquivo .env dentro da pasta core/ com:

TMDB_API_KEY=sua_chave_tmdb_aqui
Execute as migrações:



python manage.py migrate
Inicie o servidor:


python manage.py runserver
O backend estará disponível em:
http://127.0.0.1:8000/

3. Configure o frontend
cd ../frontend
npm install
npm start

O frontend abrirá em:
http://localhost:3000/


🔐 Variáveis de Ambiente
No arquivo .env (dentro da pasta core do Django):

TMDB_API_KEY=xxxxxxxxxxxxxxxxxxxxx
Essa chave pode ser obtida gratuitamente em https://www.themoviedb.org/settings/api

🌐 Deploy
Backend
O backend pode ser hospedado em:

Render

Railway.app

PythonAnywhere

Frontend (Vercel)
Faça login na Vercel com sua conta GitHub.

Clique em "Add New Project" e importe o repositório.

Escolha a pasta frontend/ como raiz do projeto.

Configure variáveis se precisar (ex: REACT_APP_API_BASE).

Clique em Deploy e aguarde a publicação.

🗂️ Estrutura do Projeto

filmes-favoritos/
├── backend/
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   ├── favorites/
│   │   ├── views.py
│   │   ├── models.py
│   │   └── urls.py
│   └── db.sqlite3
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── ...
│   └── package.json
│
└── README.md

🧠 Aprendizados
Durante o desenvolvimento, pratiquei:

Criação de APIs REST com Django

Integração entre frontend e backend via Axios

Uso de variáveis de ambiente e CORS

Geração de PDFs personalizados com jsPDF

Alternância entre temas claro/escuro

Deploy utilizando GitHub e Vercel

👤 Autor
Douglas Zago
📚 Estudante de Análise e Desenvolvimento de Sistemas
💻 Apaixonado por desenvolvimento web e backend em Python

📝 Observação
Este projeto utiliza dados da API do TMDB, mas não é endossado nem certificado por eles.

