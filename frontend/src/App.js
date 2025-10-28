import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

// Página principal
function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await axios.get(`${API_BASE}/search/?query=${query}`);
      setMovies(response.data.results || []);
    } catch (error) {
      console.error("Erro ao buscar filmes:", error);
    }
  };

  const addFavorite = async (movie) => {
    try {
      await axios.post(`${API_BASE}/favorites/`, {
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
      });
      alert(`"${movie.title}" foi adicionado aos favoritos!`);
      fetchFavorites();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Esse filme já está nos favoritos!");
      } else {
        console.error("Erro ao adicionar favorito:", error);
      }
    }
  };

  const removeFavorite = async (id) => {
    try {
      await axios.delete(`${API_BASE}/favorites/${id}/`);
      fetchFavorites();
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_BASE}/favorites/`);
      setFavorites(response.data);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>🎬 Search Movies</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Digite o nome do filme..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      <h2>Resultados da Busca</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div
              key={movie.id}
              style={{
                width: "220px",
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "10px",
                color: "white",
                textAlign: "center",
              }}
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  style={{ borderRadius: "8px", marginBottom: "8px" }}
                />
              ) : (
                <p>Sem imagem</p>
              )}
              <h3>{movie.title}</h3>
              <p>Nota: {movie.vote_average}</p>
              <button
                onClick={() => addFavorite(movie)}
                style={{
                  backgroundColor: "#ffb703",
                  border: "none",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                ⭐ Favoritar
              </button>
            </div>
          ))
        ) : (
          <p>Nenhum filme encontrado.</p>
        )}
      </div>

      <h2 style={{ marginTop: "40px" }}>⭐ Meus Favoritos</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {favorites.length > 0 ? (
          favorites.map((fav) => (
            <div
              key={fav.id}
              style={{
                width: "220px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "10px",
                color: "white",
                textAlign: "center",
              }}
            >
              {fav.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${fav.poster_path}`}
                  alt={fav.title}
                  style={{ borderRadius: "8px", marginBottom: "8px" }}
                />
              ) : (
                <p>Sem imagem</p>
              )}
              <h3>{fav.title}</h3>
              <p>Nota: {fav.vote_average}</p>
              <button
                onClick={() => removeFavorite(fav.id)}
                style={{
                  backgroundColor: "#ef233c",
                  border: "none",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                ❌ Remover
              </button>
            </div>
          ))
        ) : (
          <p>Você ainda não tem favoritos.</p>
        )}
      </div>

      <button
        onClick={() => {
          const ids = favorites.map((fav) => fav.id).join(",");
          const link = `${window.location.origin}/favorites?ids=${ids}`;
          navigator.clipboard.writeText(link);
          alert("Link copiado para a área de transferência!");
        }}
        style={{
          marginTop: "20px",
          backgroundColor: "#219ebc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "10px 15px",
          cursor: "pointer",
        }}
      >
        🔗 Compartilhar Lista de Favoritos
      </button>
      <button
        onClick={() => {
          const ids = favorites.map((fav) => fav.id).join(",");
          if (ids) {
            window.open(`/favorites?ids=${ids}`, "_blank");
          } else {
            alert("Você ainda não tem filmes favoritos para visualizar.");
          }
        }}
        style={{
          marginTop: "10px",
          backgroundColor: "#8ecae6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "10px 15px",
          cursor: "pointer",
        }}
      >
        Ir para página de favoritos compartilhados
      </button>
    </div>
  );
}

// Página de favoritos compartilhados
function SharedFavorites() {
  const [movies, setMovies] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ids = params.get("ids");
    if (ids) {
      const idList = ids.split(",");
      Promise.all(
        idList.map((id) =>
          axios.get(`${API_BASE}/favorites/${id}/`).then((res) => res.data)
        )
      )
        .then((results) => setMovies(results))
        .catch((err) => console.error("Erro ao carregar favoritos:", err));
    }
  }, [location.search]);

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>⭐ Lista Compartilhada</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {movies.length > 0 ? (
          movies.map((fav) => (
            <div
              key={fav.id}
              style={{
                width: "220px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "10px",
                color: "white",
                textAlign: "center",
              }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${fav.poster_path}`}
                alt={fav.title}
                style={{ borderRadius: "8px", marginBottom: "8px" }}
              />
              <h3>{fav.title}</h3>
              <p>Nota: {fav.vote_average}</p>
            </div>
          ))
        ) : (
          <p>Nenhum favorito encontrado.</p>
        )}
      </div>
    </div>
  );
}

// App principal com as rotas
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<SharedFavorites />} />
      </Routes>
    </Router>
  );
}

export default App;
