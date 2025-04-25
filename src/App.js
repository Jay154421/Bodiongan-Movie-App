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
      const userKey = `favorites_${session.user.id}`;
      const favorites = JSON.parse(localStorage.getItem(userKey)) || [];

      const exists = favorites.some((fav) => fav.imdbID === movie.imdbID);
      if (exists) {
        alert(`${movie.Title} is already in your favorites!`);
        return;
      }

      const updatedFavorites = [...favorites, movie];
      localStorage.setItem(userKey, JSON.stringify(updatedFavorites));
      alert(`${movie.Title} added to favorites!`);
    } catch (error) {
      alert("An error occurred while saving to favorites");
    }
  };

  const markAsWatched = (movie) => {
    if (!session) return;

    try {
      const userKey = `watched_${session.user.id}`;
      const watched = JSON.parse(localStorage.getItem(userKey)) || [];

      const exists = watched.some((w) => w.imdbID === movie.imdbID);
      if (exists) {
        alert(`${movie.Title} is already in your watched list!`);
        return;
      }

      const updatedWatched = [...watched, movie];
      localStorage.setItem(userKey, JSON.stringify(updatedWatched));
      alert(`${movie.Title} marked as watched!`);
    } catch (error) {
      alert("An error occurred while marking as watched");
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
        <Header onSignOut={() => supabase.auth.signOut()} session={session} />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black p-4">
        <div className="bg-[#292929] p-8 rounded-xl shadow-xl w-full max-w-md border border-[#FF5733]">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#00BFFF] to-[#FF5733] bg-clip-text text-transparent">
              Watchly
            </h1>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#FF5733",
                    brandAccent: "#e04d2d",
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
        <Header onSignOut={() => supabase.auth.signOut()} session={session} />
        <div className="bg-zinc-800/50 backdrop-blur-md flex w-full mt-4 mb-8 rounded-lg shadow-md p-2">
          <SearchBar />
        </div>
      </div>

      <main className="pb-12">
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
                  onWatched={markAsWatched}
                  session={session}
                />
              ))}
            </div>

            {totalResults > 20 && (
              <div className="mt-12 flex flex-col items-center">
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-sm text-gray-400">Showing</span>
                  <span className="font-medium text-white">
                    {(currentPage - 1) * 20 + 1}-
                    {Math.min(currentPage * 20, totalResults)}
                  </span>
                  <span className="text-sm text-gray-400">of</span>
                  <span className="font-medium text-white">{totalResults}</span>
                  <span className="text-sm text-gray-400">results</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePagination("prev")}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      currentPage === 1
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-zinc-700 hover:bg-[#00BFFF] text-white hover:scale-110"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {Array.from({
                    length: Math.min(5, Math.ceil(totalResults / 20)),
                  }).map((_, i) => {
                    const pageNumber = i + 1;
                    const isCurrent = pageNumber === currentPage;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentPage(pageNumber);
                          searchMovies(searchQuery, pageNumber);
                        }}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                          isCurrent
                            ? "bg-[#00BFFF] text-white scale-110"
                            : "bg-zinc-700 hover:bg-zinc-600 text-white"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  {Math.ceil(totalResults / 20) > 5 && (
                    <span className="text-gray-400 px-2">...</span>
                  )}

                  <button
                    disabled={currentPage === Math.ceil(totalResults / 20)}
                    onClick={() => handlePagination("next")}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      currentPage === Math.ceil(totalResults / 20)
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-zinc-700 hover:bg-[#00BFFF] text-white hover:scale-110"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            Welcome to our movie collection! Search for a movie above.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;