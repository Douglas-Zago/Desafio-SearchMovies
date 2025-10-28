# 🎬 Search Movies

Aplicação desenvolvida como parte do desafio técnico **Elite Dev**, com o objetivo de criar uma lista de filmes que permite:
- Pesquisar filmes utilizando a API do **The Movie Database (TMDb)**.
- Adicionar e remover filmes dos favoritos.
- Compartilhar a lista de favoritos por link.

---

## 🚀 Tecnologias Utilizadas

### Front-End
- React.js (Create React App)
- Axios (requisições HTTP)
- React Router DOM (rotas)
- CSS (estilização simples e responsiva)

### Back-End
- Django (API REST)
- Requests (integração com a API TMDb)
- SQLite (banco de dados local)

---

## ⚙️ Funcionalidades

✅ **Busca de filmes** — consulta à API TMDb e exibe os resultados.  
✅ **Adicionar aos favoritos** — salva o filme no banco de dados via API Django.  
✅ **Remover dos favoritos** — permite excluir filmes salvos.  
✅ **Compartilhar lista** — gera um link com os filmes favoritos.  
✅ **Página de favoritos compartilhados** — exibe filmes enviados pelo link.  

---

## 🧠 Estrutura do Projeto

Filmes-Favoritos/
│
├── backend/
│ ├── core/
│ └── favorites/
│ ├── models.py
│ ├── views.py
│ ├── urls.py
│ └── migrations/
│
├── frontend/
│ ├── src/
│ │ ├── App.js
│ │ ├── index.js
│ │ └── App.css
│ └── package.json
│
└── README.md

## 🧩 Como Executar o Projeto

### 🔹 Back-End (Django)
1. Acesse a pasta `backend`
2. Crie e ative o ambiente virtual:
   
   python -m venv venv
   venv\Scripts\activate
Instale as dependências:

pip install -r requirements.txt
Rode o servidor:

python manage.py runserver
O back-end estará disponível em:
👉 http://127.0.0.1:8000

🔹 Front-End (React)
Acesse a pasta frontend

Instale as dependências:

npm install
Inicie o servidor de desenvolvimento:

npm start
O front-end estará disponível em:
👉 http://localhost:3000

🔗 Deploy
Serviço	Descrição	Status
Vercel	Front-end React hospedado	🔄 A implementar
Render/Railway	Back-end Django hospedado	🔄 A implementar

📄 Créditos
API: The Movie Database (TMDb)

Desenvolvido por Douglas Zago

Desafio técnico: Elite Dev 2025

🖼️ Demonstração (adicionar após finalização)
Tela de busca

Lista de favoritos

Página de compartilhamento