import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const searchMovies = async (query, page = 1) => {
    const API_KEY = "7118e59c";
    try {
      setLoading(true);

      // Fetch first page (Page 1)
      const response1 = await fetch(
        `https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${API_KEY}`
      );
      const data1 = await response1.json();

      // Fetch second page (Page 2) if not on the last page
      const response2 = await fetch(
        `https://www.omdbapi.com/?s=${query}&page=${page + 1}&apikey=${API_KEY}`
      );
      const data2 = await response2.json();

      if (data1.Response === "True" && data2.Response === "True") {
        // Combine the two pages (20 results)
        const combinedResults = [...data1.Search, ...data2.Search];

        // Fetch detailed information for each movie
        const moviesWithDetails = await Promise.all(
          combinedResults.map(async (movie) => {
            const detailRes = await fetch(
              `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`
            );
            return await detailRes.json();
          })
        );

        setMovies(moviesWithDetails);
        setSearchQuery(query);
        setCurrentPage(page);
        setTotalResults(parseInt(data1.totalResults, 10)); // totalResults is the same for both pages
      } else {
        setMovies([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchMovies,
        movies,
        loading,
        currentPage,
        setCurrentPage,
        totalResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
