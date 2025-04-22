import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import Header from "./components/Header";

const supabase = createClient(
  "https://zlekvshwkmdqpfikkfos.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZWt2c2h3a21kcXBmaWtrZm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMjc3MTAsImV4cCI6MjA2MDgwMzcxMH0.V5ZSkpXT151m7wn7uSFMIgWayhtYHZfRr02H-IIAlHw"
);

function App() {
  const [session, setSession] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    };

    checkSession();
  }, []);

  const searchMovies = async (query, page = 1) => {
    const API_KEY = "7118e59c";
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${API_KEY}`
      );
      const data = await response.json();

      if (data.Response === "True") {
        // Fetch full details for each movie
        const moviesWithDetails = await Promise.all(
          data.Search.map(async (movie) => {
            const detailRes = await fetch(
              `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`
            );
            const detailData = await detailRes.json();
            return detailData;
          })
        );

        setMovies(moviesWithDetails);
        setTotalResults(parseInt(data.totalResults, 10));
        setSearchQuery(query);
        setCurrentPage(page);
      } else {
        setMovies([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const saveToFavorites = async (movie) => {
    if (!session) return;

    try {
      const { error } = await supabase.from("favorites").insert([
        {
          movie_id: movie.imdbID,
          title: movie.Title,
          poster: movie.Poster,
          year: movie.Year,
          type: movie.Type,
          user_id: session.user.id,
        },
      ]);

      if (error) {
        console.error("Error saving favorite:", error);
        alert(`Error: ${error.message}`);
      } else {
        alert(`${movie.Title} added to favorites!`);
      }
    } catch (error) {
      console.error("Error saving favorite:", error);
      alert("An error occurred while saving to favorites");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4 text-white">
        <div className="bg-zinc-900 p-8 rounded-xl shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">🎬 Movie App</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google", "github"]}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white p-4 font-sans">
        <Header />

        <div className="bg-red-800 flex w-full mb-8 ">
          <SearchBar onSearch={(query) => searchMovies(query, 1)} />
        </div>
        <div className="max-w-7xl mx-auto">
          {movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    onSave={saveToFavorites}
                  />
                ))}
              </div>

              {totalResults > 10 && (
                <div className="flex justify-center mt-8 gap-6 items-center">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => searchMovies(searchQuery, currentPage - 1)}
                    className={`px-4 py-2 rounded-full font-semibold ${
                      currentPage === 1
                        ? "bg-zinc-700 text-gray-400 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200 transition"
                    }`}
                  >
                    ◀ Prev
                  </button>

                  <span className="text-lg tracking-wide">
                    Page {currentPage} / {Math.ceil(totalResults / 10)}
                  </span>

                  <button
                    disabled={currentPage === Math.ceil(totalResults / 10)}
                    onClick={() => searchMovies(searchQuery, currentPage + 1)}
                    className={`px-4 py-2 rounded-full font-semibold ${
                      currentPage === Math.ceil(totalResults / 10)
                        ? "bg-zinc-700 text-gray-400 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200 transition"
                    }`}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              {searchQuery === ""
                ? "Search for a movie to begin..."
                : "No movies found. Try a different title."}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
