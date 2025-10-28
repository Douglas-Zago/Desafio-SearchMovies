import { createContext, useContext, useMemo, useState } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => new Set());

  const value = useMemo(() => ({
    favorites,
    isFav: (id) => favorites.has(id),
    toggleFav: (id) => setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    })
  }), [favorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
