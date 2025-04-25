import React, { useState, useEffect } from "react";

const MovieCard = ({ movie, onSave, onWatched, session }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [userRatings, setUserRatings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const posterUrl =
    movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster";

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!showDetails) return;

      setTrailerLoading(true);
      try {
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

    if (showDetails && session) {
      const ratingsKey = `ratings_${movie.imdbID}`;
      const savedRatings = JSON.parse(localStorage.getItem(ratingsKey)) || [];
      setUserRatings(savedRatings);

      const userRatingObj = savedRatings.find(
        (r) => r.userId === session.user.id
      );
      if (userRatingObj) {
        setUserRating(userRatingObj.rating);
        setUserReview(userRatingObj.review || "");
      } else {
        setUserRating(0);
        setUserReview("");
      }
    }
  }, [showDetails, movie.Title, movie.Year, movie.imdbID, session]);

  const handleRatingSubmit = () => {
    if (!session || !userRating) return;

    try {
      const ratingsKey = `ratings_${movie.imdbID}`;
      const newRating = {
        userId: session.user.id,
        userName: session.user.email,
        rating: userRating,
        review: userReview,
        date: new Date().toISOString(),
      };

      const existingRatings =
        JSON.parse(localStorage.getItem(ratingsKey)) || [];
      const updatedRatings = [
        ...existingRatings.filter((r) => r.userId !== session.user.id),
        newRating,
      ];

      localStorage.setItem(ratingsKey, JSON.stringify(updatedRatings));
      setUserRatings(updatedRatings);
      setIsEditing(false);
      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error saving rating:", error);
      alert("Failed to save rating");
    }
  };

  const handleDeleteRating = () => {
    if (!session) return;

    try {
      const ratingsKey = `ratings_${movie.imdbID}`;
      const updatedRatings = userRatings.filter(
        (r) => r.userId !== session.user.id
      );

      localStorage.setItem(ratingsKey, JSON.stringify(updatedRatings));
      setUserRatings(updatedRatings);
      setUserRating(0);
      setUserReview("");
      setIsEditing(false);
      alert("Rating deleted successfully!");
    } catch (error) {
      console.error("Error deleting rating:", error);
      alert("Failed to delete rating");
    }
  };

  const averageRating =
    userRatings.length > 0
      ? userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length
      : 0;

  const userHasRated = userRatings.some((r) => r.userId === session?.user.id);

  return (
    <>
      <div className="relative group bg-zinc-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        <div className="relative h-80 overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.Title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>

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

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 bg-zinc-700 hover:bg-[#FF5733] text-white rounded-md text-sm font-medium transition-all"
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

      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
            <div className="sticky top-0 bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-700 z-10">
              <h2 className="text-2xl font-bold text-white">{movie.Title}</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setTrailerUrl(null);
                  setIsEditing(false);
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

                  <div className="mt-6">
                    <p className="text-lg font-semibold mb-3">
                      Ratings & Reviews
                    </p>

                    <div className="mb-4">
                      <p className="text-sm text-gray-400">Average Rating</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-2xl ${
                              star <= Math.round(averageRating)
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm text-gray-300">
                          ({averageRating.toFixed(1)} from {userRatings.length}{" "}
                          ratings)
                        </span>
                      </div>
                    </div>

                    {session && (
                      <div className="bg-zinc-800 p-4 rounded-lg mb-6">
                        {userHasRated && !isEditing ? (
                          <div>
                            <h4 className="text-md font-medium mb-3">
                              Your Rating
                            </h4>
                            <div className="flex items-center mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-2xl ${
                                    star <= userRating
                                      ? "text-yellow-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {userReview && (
                              <p className="text-sm text-gray-300 mb-3">
                                {userReview}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-[#FF5733] text-white rounded-md hover:bg-[#e04d2d] transition"
                              >
                                Edit Review
                              </button>
                              <button
                                onClick={handleDeleteRating}
                                className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-md font-medium mb-3">
                              {userHasRated
                                ? "Edit Your Rating"
                                : "Rate This Movie"}
                            </h4>
                            <div className="flex items-center mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setUserRating(star)}
                                  className={`text-2xl ${
                                    star <= userRating
                                      ? "text-yellow-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={userReview}
                              onChange={(e) => setUserReview(e.target.value)}
                              placeholder="Write your review..."
                              className="w-full p-2 bg-zinc-700 text-white rounded-md mb-3"
                              rows="3"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleRatingSubmit}
                                disabled={!userRating}
                                className={`px-4 py-2 rounded-md ${
                                  !userRating
                                    ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                                    : "bg-[#FF5733] hover:bg-[#e04d2d] text-white"
                                }`}
                              >
                                {userHasRated ? "Update" : "Submit"}
                              </button>
                              {isEditing && (
                                <button
                                  onClick={() => setIsEditing(false)}
                                  className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 transition"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {userRatings.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-md font-medium">User Reviews</h4>
                        {userRatings.map((rating, index) => (
                          <div
                            key={index}
                            className="bg-zinc-800 p-3 rounded-lg"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-medium text-sm">
                                {rating.userName || "Anonymous"}
                              </p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-sm ${
                                      star <= rating.rating
                                        ? "text-yellow-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            {rating.review && (
                              <p className="text-sm text-gray-300">
                                {rating.review}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(rating.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
