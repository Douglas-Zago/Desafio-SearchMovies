import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Container, Button, Badge, Row, Col, Card, Form, InputGroup, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const API_BASE = "https://desafio-searchmovies-backend-5qwb.onrender.com/api";
const fallbackPoster = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

const getPosterUrl = (path, size = "w300") => {
  if (!path) return fallbackPoster;
  return path.startsWith("http") ? path : `https://image.tmdb.org/t/p/${size}${path}`;
};

const fetchDataUrlViaProxy = async (url) => {
  const res = await fetch(`${API_BASE}/proxy-image/?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error("proxy failed");
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(blob);
  });
};

function MovieCard({ data, onPrimary, primaryLabel, primaryVariant = "warning" }) {
  const posterUrl = getPosterUrl(data.poster_path, "w300");
  return (
    <OverlayTrigger
      placement="auto"
      overlay={
        <Tooltip className="movie-tooltip">
          <div style={{ textAlign: "left", maxWidth: 250 }}>
            <strong>{data.title}</strong>
            <div><small>Data: {data.release_date || "N/A"}</small></div>
            <div><small>Nota: {data.vote_average ?? "N/A"}</small></div>
            <div style={{ marginTop: 4 }}>
              <small>{data.overview ? data.overview.slice(0, 120) + "..." : "Sem sinopse disponível."}</small>
            </div>
          </div>
        </Tooltip>
      }
    >
      <Card className="h-100 shadow-sm card-hover card-dark movie-card">
        <div className="ratio ratio-2x3 rounded-top overflow-hidden">
          <Card.Img
            src={posterUrl}
            alt={data.title}
            onError={(e) => (e.target.src = fallbackPoster)}
            className="object-fit-cover"
            style={{ transition: "transform 0.3s ease", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="fs-6 text-truncate mb-1">{data.title}</Card.Title>
          <div className="text-muted small mb-3">Nota: {data.vote_average ?? "N/A"}</div>
          <div className="mt-auto">
            <Button onClick={onPrimary} size="sm" variant={primaryVariant} className="w-100">
              {primaryLabel}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </OverlayTrigger>
  );
}

function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  const showToast = (msg, variant = "success") => {
    setToast({ show: true, message: msg, variant });
    setTimeout(() => setToast({ show: false, message: "", variant: "success" }), 2500);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const response = await axios.get(`${API_BASE}/search/?query=${encodeURIComponent(query)}`);
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
      fetchFavorites();
      showToast(`"${movie.title}" adicionado aos favoritos!`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        showToast("Esse filme já está nos favoritos!", "warning");
      } else {
        console.error("Erro ao adicionar favorito:", error);
      }
    }
  };

  const removeFavorite = async (id) => {
    try {
      const title = favorites.find((f) => f.id === id)?.title || "Filme";
      await axios.delete(`${API_BASE}/favorites/${id}/`);
      fetchFavorites();
      showToast(`"${title}" removido dos favoritos!`, "danger");
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

  const exportFavoritesToPDF = async (items) => {
    if (!items.length) {
      showToast("Nenhum filme para exportar.", "warning");
      return;
    }
    const doc = new jsPDF("p", "mm", "a4");
    const marginX = 15;
    const marginY = 20;
    let y = marginY;
    doc.setFontSize(16);
    doc.text("Meus Filmes Favoritos", marginX, y);
    y += 10;
    for (const fav of items) {
      if (y > 270) {
        doc.addPage();
        y = marginY;
      }
      try {
        const dataUrl = await fetchDataUrlViaProxy(getPosterUrl(fav.poster_path, "w300"));
        const fmt = dataUrl.includes("image/png") ? "PNG" : "JPEG";
        doc.addImage(dataUrl, fmt, marginX, y, 35, 52);
      } catch (_) {
        try {
          const ph = await fetchDataUrlViaProxy(fallbackPoster);
          doc.addImage(ph, "JPEG", marginX, y, 35, 52);
        } catch {}
      }
      doc.setFontSize(12);
      doc.text(fav.title || "Sem título", marginX + 45, y + 6, { maxWidth: 140 });
      doc.setFontSize(10);
      doc.text(`Nota: ${fav.vote_average ?? "N/A"}`, marginX + 45, y + 14);
      y += 60;
    }
    doc.save("favoritos.pdf");
    showToast("PDF gerado com sucesso!");
  };

  return (
    <div className="App">
      <Container>
        <div className="mx-auto mb-4" style={{ maxWidth: 900 }}>
          <h1 className="display-6 text-center mb-3">Search Movies</h1>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control placeholder="Digite o nome do filme..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button type="submit">Buscar</Button>
            </InputGroup>
          </Form>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="h4 m-0">Resultados da Busca</h2>
            <div className="kpi">Exibidos <strong>{movies.length}</strong></div>
          </div>
          <Row className="g-3">
            {movies.length > 0 ? (
              movies.map((m) => (
                <Col key={m.id} xs={12} sm={6} md={4} lg={3}>
                  <MovieCard data={m} onPrimary={() => addFavorite(m)} primaryLabel="⭐ Favoritar" primaryVariant="warning" />
                </Col>
              ))
            ) : (
              <div className="text-muted">Nenhum filme encontrado.</div>
            )}
          </Row>
        </div>

        <div className="section">
          <div className="section-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <h2 className="h4 m-0">Meus Favoritos</h2>
              <Badge bg="secondary">{favorites.length}</Badge>
            </div>
            <OverlayTrigger placement="left" overlay={<Tooltip>Exporta os filmes desta seção</Tooltip>}>
              <Dropdown className="ms-auto">
                <Dropdown.Toggle variant="success">Exportar PDF</Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => exportFavoritesToPDF(favorites)}>Todos os favoritos</Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      exportFavoritesToPDF(
                        favorites.filter((f) => (query ? (f.title || "").toLowerCase().includes(query.toLowerCase()) : true))
                      )
                    }
                  >
                    Só os que combinam com a busca
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </OverlayTrigger>
          </div>

          <Row className="g-3">
            {favorites.length > 0 ? (
              favorites.map((fav) => (
                <Col key={fav.id} xs={12} sm={6} md={4} lg={3}>
                  <MovieCard data={fav} onPrimary={() => removeFavorite(fav.id)} primaryLabel="❌ Remover" primaryVariant="danger" />
                </Col>
              ))
            ) : (
              <div className="text-muted">Você ainda não tem favoritos.</div>
            )}
          </Row>
        </div>

        <div className="d-flex gap-2 justify-content-center mt-4">
          <Button
            onClick={() => {
              const ids = favorites.map((fav) => fav.id).join(",");
              const link = `${window.location.origin}/favorites?ids=${ids}`;
              navigator.clipboard.writeText(link);
              showToast("Link copiado para a área de transferência!");
            }}
            variant="info"
          >
            Compartilhar lista de favoritos
          </Button>
          <Button
            onClick={() => {
              const ids = favorites.map((fav) => fav.id).join(",");
              if (ids) {
                window.open(`/favorites?ids=${ids}`, "_blank");
              } else {
                showToast("Você ainda não tem filmes favoritos.", "warning");
              }
            }}
            variant="secondary"
          >
            Abrir página compartilhada
          </Button>
        </div>
      </Container>

      <footer className="footer">
        <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>Feito por <strong>Douglas Zago</strong></div>
          <div className="text-muted small">Este projeto usa dados do TMDB. Não é endossado ou certificado pela TMDB.</div>
        </Container>
      </footer>

      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div className={`toast align-items-center text-white bg-${toast.variant} border-0 show ${toast.show ? "fade-in" : "fade-out"}`}>
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SharedFavorites() {
  const [movies, setMovies] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ids = params.get("ids");
    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      Promise.all(idList.map((id) => axios.get(`${API_BASE}/favorites/${id}/`).then((res) => res.data)))
        .then((results) => setMovies(results))
        .catch((err) => console.error("Erro ao carregar favoritos:", err));
    }
  }, [location.search]);

  return (
    <>
      <div className="App" style={{ padding: 20 }}>
        <Container>
          <h1>⭐ Lista Compartilhada</h1>
          <Row className="g-3">
            {movies.length > 0 ? (
              movies.map((fav) => (
                <Col key={fav.id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="h-100 shadow-sm card-dark">
                    <div className="ratio ratio-2x3 rounded-top overflow-hidden">
                      <Card.Img
                        src={getPosterUrl(fav.poster_path, "w300")}
                        alt={fav.title}
                        onError={(e) => (e.target.src = fallbackPoster)}
                        className="object-fit-cover"
                      />
                    </div>
                    <Card.Body>
                      <Card.Title className="fs-6 text-truncate mb-1">{fav.title}</Card.Title>
                      <div className="text-muted small">Nota: {fav.vote_average ?? "N/A"}</div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="text-muted">Nenhum favorito encontrado.</div>
            )}
          </Row>
        </Container>
      </div>
      <footer className="footer">
        <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>Feito por <strong>Douglas Zago</strong></div>
          <div className="text-muted small">Este projeto usa dados do TMDB. Não é endossado ou certificado pela TMDB.</div>
        </Container>
      </footer>
    </>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <Router>
      <Navbar bg={theme === "dark" ? "dark" : "light"} variant={theme === "dark" ? "dark" : "light"} className="mb-4 shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand className="d-flex align-items-center gap-2">
            <span role="img" aria-label="film">📽️</span> Filmes Favoritos
          </Navbar.Brand>
          <Button variant={theme === "dark" ? "outline-light" : "outline-dark"} size="sm" onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </Button>
        </Container>
      </Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<SharedFavorites />} />
      </Routes>
    </Router>
  );
}

export default App;
