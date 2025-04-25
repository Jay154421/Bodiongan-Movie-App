import React, { useState, useEffect } from "react";

const MovieCard = ({ movie, onSave, onWatched, session }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  const posterUrl =
    movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster";

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!showDetails) return;
      
      setTrailerLoading(true);
      try {
        // Using YouTube API to search for trailer
        const API_KEY = "AIzaSyDwsJMC7Ne_padF3YzBuqMObtW783-9Pg0"; 
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            `${movie.Title} ${movie.Year} official trailer`
          )}&maxResults=1&key=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const videoId = data.items[0].id.videoId;
          setTrailerUrl(`https://www.youtube.com/embed/${videoId}`);
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
      } finally {
        setTrailerLoading(false);
      }
    };

    fetchTrailer();
  }, [showDetails, movie.Title, movie.Year]);

  return (
    <>
      <div className="relative group bg-zinc-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        {/* Poster Image */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.Title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>

        {/* Movie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold line-clamp-1">{movie.Title}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-300">{movie.Year}</span>
            {movie.imdbRating && (
              <span className="flex items-center text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                ⭐ {movie.imdbRating}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 bg-zinc-700  hover:bg-[#FF5733] text-white rounded-md text-sm font-medium transition-all"
            >
              Details
            </button>

            <button
              onClick={() => onSave(movie)}
              disabled={!session}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                !session
                  ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                  : "bg-[#FF5733]/90 hover:bg-[#FF5733] text-white"
              }`}
              title={!session ? "Please sign in to save favorites" : ""}
            >
              ❤️
            </button>

            <button
              onClick={() => onWatched(movie)}
              disabled={!session}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                !session
                  ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                  : "bg-[#4CAF50]/90 hover:bg-[#4CAF50] text-white"
              }`}
              title={!session ? "Please sign in to mark as watched" : ""}
            >
              ✓
            </button>
          </div>
        </div>
      </div>

      {/* Movie Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
            <div className="sticky top-0 bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-700 z-10">
              <h2 className="text-2xl font-bold  text-white">
                {movie.Title}
              </h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setTrailerUrl(null); // Reset trailer when closing
                }}
                className="text-gray-400 hover:text-[#FF5733] text-3xl transition"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <img
                    src={posterUrl}
                    alt={movie.Title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>

                <div className="w-full md:w-2/3 space-y-4 text-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    {movie.Year && (
                      <div>
                        <p className="text-sm text-gray-400">Year</p>
                        <p className="font-medium">{movie.Year}</p>
                      </div>
                    )}

                    {movie.imdbRating && (
                      <div>
                        <p className="text-sm text-gray-400">Rating</p>
                        <p className="font-medium flex items-center">
                          ⭐ {movie.imdbRating}
                        </p>
                      </div>
                    )}

                    {movie.Director && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400">Director</p>
                        <p className="font-medium">{movie.Director}</p>
                      </div>
                    )}

                    {(movie.Cast || movie.Actors) && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400">Cast</p>
                        <p className="font-medium">
                          {movie.Cast || movie.Actors}
                        </p>
                      </div>
                    )}
                  </div>

                  {movie.Plot && (
                    <div>
                      <p className="text-sm text-gray-400">Overview</p>
                      <p className="font-medium">{movie.Plot}</p>
                    </div>
                  )}

                  {/* Trailer Section */}
                  <div className="mt-6">
                    <p className="text-lg font-semibold mb-3">Trailer</p>
                    {trailerLoading ? (
                      <div className="flex justify-center items-center h-40 bg-zinc-800 rounded-md">
                        <span className="loader"></span>
                      </div>
                    ) : trailerUrl ? (
                      <div className="aspect-w-16 aspect-h-9">
                        <iframe
                          className="w-full h-64 md:h-80 rounded-md"
                          src={trailerUrl}
                          title={`${movie.Title} Trailer`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="bg-zinc-800 rounded-md p-4 text-center text-gray-400">
                        Trailer not available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => {
                    onSave(movie);
                    setShowDetails(false);
                  }}
                  disabled={!session}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    !session
                      ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      : "bg-[#FF5733] hover:bg-[#e04d2d] text-white"
                  }`}
                >
                  Add to Favorites
                </button>
                <button
                  onClick={() => {
                    onWatched(movie);
                    setShowDetails(false);
                  }}
                  disabled={!session}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    !session
                      ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      : "bg-[#3c3d3c] hover:bg-[#FF5733] text-white"
                  }`}
                >
                  Mark as Watched
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;