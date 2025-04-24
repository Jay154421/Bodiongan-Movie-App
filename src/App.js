import { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";

import { useSearch } from "./components/SearchContext";

const supabase = createClient(
  "https://zlekvshwkmdqpfikkfos.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZWt2c2h3a21kcXBmaWtrZm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMjc3MTAsImV4cCI6MjA2MDgwMzcxMH0.V5ZSkpXT151m7wn7uSFMIgWayhtYHZfRr02H-IIAlHw"
);

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const {
    searchQuery,
    searchMovies,
    movies,
    loading,
    currentPage,
    setCurrentPage,
    totalResults,
  } = useSearch();

  console.log("See:", searchQuery);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);

      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    };

    checkSession();
  }, []);

  const saveToFavorites = (movie) => {
    if (!session) return;

    try {
      // Create a user-specific key for localStorage
      const userKey = `favorites_${session.user.id}`;

      // Get existing favorites for this user
      const favorites = JSON.parse(localStorage.getItem(userKey)) || [];

      // Check if movie already exists
      const exists = favorites.some((fav) => fav.imdbID === movie.imdbID);

      if (exists) {
        alert(`${movie.Title} is already in your favorites!`);
        return;
      }

      // Add new movie to favorites
      const updatedFavorites = [...favorites, movie];

      // Save back to localStorage
      localStorage.setItem(userKey, JSON.stringify(updatedFavorites));
      alert(`${movie.Title} added to favorites!`);
    } catch (error) {
      alert("An error occurred while saving to favorites");
    }
  };

  const handlePagination = (direction) => {
    const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    setCurrentPage(nextPage);
    searchMovies(searchQuery, nextPage);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white px-4 font-sans">
        <Header onSignOut={() => supabase.auth.signOut()} />
        <div className="bg-[#FF5733] flex w-full mb-8 rounded-lg shadow-md p-2">
          <SearchBar />
        </div>
        <div className="flex items-center justify-center mt-28">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4 ">
        <div className="bg-[#292929] p-8 rounded-xl shadow-xl w-full max-w-md border  border-[#FF5733]">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#FF5733]">
            🎬 Movie App
          </h1>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#00BFFF",
                    brandAccent: "#009acd",
                  },
                },
              },
            }}
            providers={[]}
            theme="dark"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white px-4 font-sans">
      <div className="pt-6">
        <Header onSignOut={() => supabase.auth.signOut()} />
        <div className="bg-[#FF5733] flex w-full mb-8 rounded-lg shadow-md p-2">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loader"></span>
          </div>
        ) : searchQuery.trim() !== "" ? (
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

            {totalResults > 20 && (
              <div className="flex justify-center mt-8 gap-6 items-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePagination("prev")}
                  className={`px-4 py-2 rounded-full font-semibold ${
                    currentPage === 1
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-[#00BFFF] text-white hover:bg-[#009acd] transition"
                  }`}
                >
                  ◀ Prev
                </button>

                <span className="text-lg tracking-wide">
                  Page {currentPage} / {Math.ceil(totalResults / 20)}
                </span>

                <button
                  disabled={currentPage === Math.ceil(totalResults / 20)}
                  onClick={() => handlePagination("next")}
                  className={`px-4 py-2 rounded-full font-semibold ${
                    currentPage === Math.ceil(totalResults / 20)
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-[#00BFFF] text-white hover:bg-[#009acd] transition"
                  }`}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            Welcome to our movie collection! Search for a movie above.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
