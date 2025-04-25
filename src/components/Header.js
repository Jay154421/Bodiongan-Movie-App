import { useState, useEffect } from "react";

function Header({ onSignOut, session }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [watched, setWatched] = useState([]);

  useEffect(() => {
    if (isModalOpen && session) {
      const favKey = `favorites_${session.user.id}`;
      const watchedKey = `watched_${session.user.id}`;
      const storedFavorites = JSON.parse(localStorage.getItem(favKey)) || [];
      const storedWatched = JSON.parse(localStorage.getItem(watchedKey)) || [];

      const enhancedFavorites = storedFavorites.map((movie) => {
        const ratingsKey = `ratings_${movie.imdbID}`;
        const ratings = JSON.parse(localStorage.getItem(ratingsKey)) || [];
        const userRating = ratings.find((r) => r.userId === session.user.id);
        return {
          ...movie,
          userRating: userRating ? userRating.rating : 0,
        };
      });

      const enhancedWatched = storedWatched.map((movie) => {
        const ratingsKey = `ratings_${movie.imdbID}`;
        const ratings = JSON.parse(localStorage.getItem(ratingsKey)) || [];
        const userRating = ratings.find((r) => r.userId === session.user.id);
        return {
          ...movie,
          userRating: userRating ? userRating.rating : 0,
        };
      });

      setFavorites(enhancedFavorites);
      setWatched(enhancedWatched);
    }
  }, [isModalOpen, session]);

  const removeFromList = (imdbID, listType) => {
    if (!session) return;

    const userKey = `${listType}_${session.user.id}`;
    const updatedList =
      listType === "favorites"
        ? favorites.filter((movie) => movie.imdbID !== imdbID)
        : watched.filter((movie) => movie.imdbID !== imdbID);

    localStorage.setItem(userKey, JSON.stringify(updatedList));

    if (listType === "favorites") {
      setFavorites(updatedList);
    } else {
      setWatched(updatedList);
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-black to-zinc-900 rounded-md text-sm font-medium transition-all border border-gray-700 py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#00BFFF] to-[#FF5733] bg-clip-text text-transparent">
              Watchly
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#FF5733] to-[#e04d2d] hover:from-[#e04d2d] hover:to-[#c44427] text-white font-medium transition-all transform hover:scale-105 shadow-md"
            >
              My Lists
            </button>
            <button
              onClick={onSignOut}
              className="px-5 py-2 rounded-lg border-2 border-[#FF5733] text-[#FF5733] hover:bg-[#FF5733] hover:text-white font-medium transition-all transform hover:scale-105 shadow-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 p-6 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Your Movie Lists
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-3xl"
              >
                &times;
              </button>
            </div>

            <div className="flex border-b border-zinc-700 mb-6">
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-6 py-3 font-medium text-lg ${
                  activeTab === "favorites"
                    ? "border-b-2 border-[#FF5733] text-[#FF5733]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Favorites
              </button>
              <button
                onClick={() => setActiveTab("watched")}
                className={`px-6 py-3 font-medium text-lg ${
                  activeTab === "watched"
                    ? "border-b-2 border-[#FF5733] text-[#FF5733]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Watched
              </button>
            </div>

            {!session ? (
              <p className="mb-4 text-gray-400 text-center py-8">
                Please sign in to view your lists
              </p>
            ) : activeTab === "favorites" ? (
              favorites.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-xl mb-4">No favorites yet</p>
                  <p className="text-gray-500">
                    Save some movies to see them here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {favorites.map((movie) => (
                    <div
                      key={movie.imdbID}
                      className="relative group bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-all duration-300"
                    >
                      <img
                        src={
                          movie.Poster !== "N/A"
                            ? movie.Poster
                            : "https://via.placeholder.com/300x450?text=No+Poster"
                        }
                        alt={movie.Title}
                        className="w-full h-48 object-cover rounded mb-3"
                      />
                      <div className="px-1">
                        <h3 className="font-semibold text-white truncate">
                          {movie.Title}
                        </h3>
                        <p className="text-xs text-gray-400">{movie.Year}</p>
                        {movie.userRating > 0 && (
                          <div className="flex mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-xs ${
                                  star <= movie.userRating
                                    ? "text-yellow-400"
                                    : "text-gray-500"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          removeFromList(movie.imdbID, "favorites")
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : watched.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-xl mb-4">
                  No watched movies yet
                </p>
                <p className="text-gray-500">
                  Mark some movies as watched to see them here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {watched.map((movie) => (
                  <div
                    key={movie.imdbID}
                    className="relative group bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-all duration-300"
                  >
                    <img
                      src={
                        movie.Poster !== "N/A"
                          ? movie.Poster
                          : "https://via.placeholder.com/300x450?text=No+Poster"
                      }
                      alt={movie.Title}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                    <div className="px-1">
                      <h3 className="font-semibold text-white truncate">
                        {movie.Title}
                      </h3>
                      <p className="text-xs text-gray-400">{movie.Year}</p>
                      {movie.userRating > 0 && (
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-xs ${
                                star <= movie.userRating
                                  ? "text-yellow-400"
                                  : "text-gray-500"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromList(movie.imdbID, "watched")}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-[#FF5733] text-white rounded-lg hover:bg-[#e04d2d] transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
