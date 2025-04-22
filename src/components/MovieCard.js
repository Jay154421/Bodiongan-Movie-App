import React, { useState } from "react"

const MovieCard = ({ movie, onSave }) => {
  const [showDetails, setShowDetails] = useState(false);

  const posterUrl = movie.Poster !== "N/A"
    ? movie.Poster
    : "https://via.placeholder.com/300x450?text=No+Poster"

  return (
    <>
      <div className="relative group bg-zinc-800 rounded-xl overflow-hidden shadow-md hover:scale-105 transform transition duration-300">
        <img src={posterUrl} alt={movie.Title} className="w-full h-72 object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition duration-300"></div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg font-bold">{movie.Title}</h3>
          <p className="text-sm text-gray-300">{movie.Year}</p>
          <p className="text-sm"><span className="font-semibold">Rating:</span> ⭐ {movie.imdbRating}</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setShowDetails(true)}
              className="mt-2 px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 text-sm"
            >
              Show Details
            </button>

            <button
              onClick={() => onSave(movie)}
              className="mt-3 px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 text-sm"
            >
              ❤️ Save
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-y-auto max-h-[90vh] p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
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

              <div className="flex-1 space-y-2 text-black">
                <h2 className="text-2xl font-bold">{movie.Title}</h2>
                <p className="text-gray-600">{movie.Year} • {movie.Type}</p>
                {movie.Director && <p><strong>Director:</strong> {movie.Director}</p>}
                {movie.imdbRating && <p><strong>IMDb Rating:</strong> ⭐ {movie.imdbRating}</p>}
                {movie.Runtime && <p><strong>Runtime:</strong> {movie.Runtime}</p>}
                {movie.Genre && <p><strong>Genre:</strong> {movie.Genre}</p>}
                {movie.Plot && (
                  <div>
                    <p className="font-semibold mt-4">Overview:</p>
                    <p className="text-gray-700">{movie.Plot}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MovieCard
