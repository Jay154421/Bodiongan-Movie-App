import React, { useState } from "react";

const MovieCard = ({ movie, onSave }) => {
  const [showDetails, setShowDetails] = useState(false);

  const posterUrl =
    movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster";

  return (
    <>
      <div className="relative group bg-zinc-800 rounded-xl overflow-hidden shadow-md hover:scale-105 transform transition duration-300">
        <img
          src={posterUrl}
          alt={movie.Title}
          className="w-full h-72 object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition duration-300"></div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg font-bold">{movie.Title}</h3>
          <p className="text-sm text-gray-300">{movie.Year}</p>
          <p className="text-sm">
            <span className="font-semibold">Rating:</span> ⭐ {movie.imdbRating}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setShowDetails(true)}
              className="mt-2 px-3 py-1 bg-[#00BFFF] rounded-md hover:bg-[#009acd] text-sm text-white transition"
            >
              Show Details
            </button>

            <button
              onClick={() => onSave(movie)}
              className="mt-2 px-3 py-1 bg-[#FF5733] rounded-md hover:bg-[#e04d2d] text-sm text-white transition"
            >
              ❤️ Save
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-y-auto max-h-[90vh] p-6 ">
            <button
              className="flex ml-auto mb-3 text-gray-600 hover:text-gray-900 text-4xl "
              onClick={() => setShowDetails(false)}
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={posterUrl}
                alt={movie.Title}
                className="w-full md:w-64 h-auto rounded-lg object-cover"
              />

              <div className="flex-1 space-y-4 text-black">
                <h2 className="text-3xl font-bold">{movie.Title}</h2>
                {movie.Year && (
                  <div className="inline-flex items-center gap-2">
                    <p className="text-lg font-semibold mb-1">Year:</p>
                    <p className="text-gray-800">{movie.Year}</p>
                  </div>
                )}

                {movie.Director && (
                  <p className="text-gray-800">
                    <strong>Director:</strong> {movie.Director}
                  </p>
                )}

                {movie.imdbRating && (
                  <p className="text-lg text-gray-700">
                    <strong>IMDb Rating:</strong> ⭐ {movie.imdbRating}
                  </p>
                )}

                {movie.Plot && (
                  <p className="text-gray-800">
                    <strong>Overview: </strong>
                    {movie.Plot}
                  </p>
                )}

                {(movie.Cast || movie.Actors) && (
                  <div>
                    <p className="text-gray-800">
                      <strong>Cast:</strong> {movie.Cast || movie.Actors}
                    </p>
                  </div>
                )}

                {movie.Trailer && (
                  <div className="mt-4">
                    <p className="text-lg font-semibold mb-2 text-black">
                      Watch Trailer:
                    </p>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        className="w-full h-full rounded-md"
                        src={movie.Trailer}
                        title={`${movie.Title} Trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;
