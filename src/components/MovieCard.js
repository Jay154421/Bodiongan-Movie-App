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
        const API_KEY = "AIzaSyCWnsnYInP_rwI8x9fdqFo_OuzmYyJyWjA";
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
        id: Date.now().toString(),
        userId: session.user.id,
        userName: session.user.email,
        rating: userRating,
        review: userReview,
        date: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
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

  const handleVote = (reviewId, voteType) => {
    if (!session) return;

    try {
      const ratingsKey = `ratings_${movie.imdbID}`;
      const updatedRatings = [...userRatings];
      const reviewIndex = updatedRatings.findIndex((r) => r.id === reviewId);

      if (reviewIndex === -1) return;

      const voteKey = `votes_${session.user.id}_${reviewId}`;
      const existingVote = localStorage.getItem(voteKey);

      // Remove previous vote if exists
      if (existingVote === "upvote") {
        updatedRatings[reviewIndex].upvotes--;
      } else if (existingVote === "downvote") {
        updatedRatings[reviewIndex].downvotes--;
      }

      // Apply new vote
      if (existingVote !== voteType) {
        if (voteType === "upvote") {
          updatedRatings[reviewIndex].upvotes++;
        } else {
          updatedRatings[reviewIndex].downvotes++;
        }
        localStorage.setItem(voteKey, voteType);
      } else {
        // If clicking the same vote again, remove it
        localStorage.removeItem(voteKey);
      }

      localStorage.setItem(ratingsKey, JSON.stringify(updatedRatings));
      setUserRatings(updatedRatings);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const getUserVote = (reviewId) => {
    if (!session) return null;
    const voteKey = `votes_${session.user.id}_${reviewId}`;
    return localStorage.getItem(voteKey);
  };

  const averageRating =
    userRatings.length > 0
      ? userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length
      : 0;

  const userHasRated = userRatings.some((r) => r.userId === session?.user.id);

  return (
    <>
      <div className="relative group bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-800">
        <div className="relative h-80 overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.Title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Film grain effect */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/film-grain.png')] opacity-5 pointer-events-none"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold line-clamp-1 drop-shadow-md">
            {movie.Title}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-300">{movie.Year}</span>
            {movie.imdbRating && (
              <span className="flex items-center text-sm font-semibold bg-black/70 px-2 py-1 rounded border border-yellow-500/30">
                ⭐ {movie.imdbRating}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 bg-black/70 hover:bg-[#FF5733] text-white rounded-md text-sm font-medium transition-all border border-gray-700 hover:border-[#FF5733]"
            >
              Details
            </button>

            <button
              onClick={() => onSave(movie)}
              disabled={!session}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all border ${
                !session
                  ? "border-gray-700 bg-black/50 text-gray-500 cursor-not-allowed"
                  : "border-[#FF5733]/50 bg-[#FF5733]/20 hover:bg-[#FF5733] text-white"
              }`}
            >
              ❤️
            </button>

            <button
              onClick={() => onWatched(movie)}
              disabled={!session}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all border ${
                !session
                  ? "border-gray-700 bg-black/50 text-gray-500 cursor-not-allowed"
                  : "border-green-500/50 bg-green-500/20 hover:bg-green-500 text-white"
              }`}
            >
              ✓
            </button>
          </div>
        </div>

        {/* Cinebar effect */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-black/80 to-transparent"></div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          {/* Poster-style background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
            style={{ backgroundImage: `url(${posterUrl})` }}
          ></div>
          
          <div className="relative bg-zinc-900/95 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-zinc-700 backdrop-blur-sm">
            {/* Close button */}
            <button
              onClick={() => {
                setShowDetails(false);
                setTrailerUrl(null);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 z-50 text-gray-400 hover:text-[#FF5733] text-3xl transition bg-black/80 rounded-full w-10 h-10 flex items-center justify-center"
            >
              &times;
            </button>

            {/* Movie header with backdrop */}
            <div 
              className="relative h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${posterUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">{movie.Title}</h2>
                <div className="flex items-center gap-4 mt-2">
                  {movie.Year && (
                    <span className="text-lg text-gray-300">{movie.Year}</span>
                  )}
                  {movie.imdbRating && (
                    <span className="flex items-center text-lg font-semibold text-white bg-black/50 px-3 py-1 rounded">
                      ⭐ {movie.imdbRating}
                    </span>
                  )}
                  {movie.Runtime && (
                    <span className="text-lg text-gray-300">{movie.Runtime}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left column - Poster and basic info */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                  <div className="relative group">
                    <img
                      src={posterUrl}
                      alt={movie.Title}
                      className="w-full h-auto rounded-lg shadow-xl transform transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#FF5733] rounded-lg transition-all duration-300 pointer-events-none"></div>
                  </div>

                  <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-bold mb-3 text-[#FF5733]">Details</h3>
                    <div className="space-y-3">
                      {movie.Genre && (
                        <div>
                          <p className="text-sm text-gray-400">Genre</p>
                          <p className="font-medium">{movie.Genre}</p>
                        </div>
                      )}
                      {movie.Director && (
                        <div>
                          <p className="text-sm text-gray-400">Director</p>
                          <p className="font-medium">{movie.Director}</p>
                        </div>
                      )}
                      {movie.Actors && (
                        <div>
                          <p className="text-sm text-gray-400">Cast</p>
                          <p className="font-medium">{movie.Actors}</p>
                        </div>
                      )}
                      {movie.Language && (
                        <div>
                          <p className="text-sm text-gray-400">Language</p>
                          <p className="font-medium">{movie.Language}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                

                {/* Right column - Plot and additional info */}
                <div className="w-full lg:w-2/3 space-y-6">
                     {/* Trailer section */}
                     <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-bold mb-4 text-[#FF5733]">Trailer</h3>
                    {trailerLoading ? (
                      <div className="flex justify-center items-center h-40 bg-zinc-900 rounded-md">
                        <div className="loader"></div>
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
                      <div className="bg-zinc-900 rounded-md p-6 text-center text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto mb-3 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Trailer not available
                      </div>
                    )}
                  </div>    

                  {/* Plot */}
                  {movie.Plot && (
                    <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700">
                      <h3 className="text-xl font-bold mb-3 text-[#FF5733]">Overview</h3>
                      <p className="text-gray-200">{movie.Plot}</p>
                    </div>
                  )}

                  {/* Ratings & Reviews section */}
                  <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700">
                    <h3 className="text-xl font-bold mb-4 text-[#FF5733]">Ratings & Reviews</h3>
                    
                    {/* Average rating */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-medium">Average Rating</span>
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
                        </div>
                        <span className="text-gray-400">
                          ({averageRating.toFixed(1)} from {userRatings.length} ratings)
                        </span>
                      </div>
                    </div>

                    {/* User rating form */}
                    {session && (
                      <div className="bg-black/50 p-4 rounded-lg mb-6 border border-zinc-700">
                        {userHasRated && !isEditing ? (
                          <div>
                            <h4 className="text-lg font-medium mb-3">Your Rating</h4>
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
                              <p className="text-gray-300 mb-4">{userReview}</p>
                            )}
                            <div className="flex gap-3">
                              <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-[#FF5733] hover:bg-[#e04d2d] text-white rounded-md transition"
                              >
                                Edit Review
                              </button>
                              <button
                                onClick={handleDeleteRating}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-lg font-medium mb-3">
                              {userHasRated ? "Edit Your Rating" : "Rate This Movie"}
                            </h4>
                            <div className="flex items-center mb-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setUserRating(star)}
                                  className={`text-3xl mx-1 transition ${
                                    star <= userRating
                                      ? "text-yellow-400 hover:text-yellow-300"
                                      : "text-gray-500 hover:text-gray-400"
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={userReview}
                              onChange={(e) => setUserReview(e.target.value)}
                              placeholder="Share your thoughts about this movie..."
                              className="w-full p-3 bg-zinc-800 text-white rounded-md mb-4 border border-zinc-700 focus:border-[#FF5733] focus:outline-none"
                              rows="4"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={handleRatingSubmit}
                                disabled={!userRating}
                                className={`px-4 py-2 rounded-md transition ${
                                  !userRating
                                    ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                                    : "bg-[#FF5733] hover:bg-[#e04d2d] text-white"
                                }`}
                              >
                                {userHasRated ? "Update" : "Submit"}
                              </button>
                              {isEditing && (
                                <button
                                  onClick={() => setIsEditing(false)}
                                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* User reviews */}
                    {userRatings.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium">User Reviews</h4>
                        {userRatings.map((rating) => {
                          const userVote = getUserVote(rating.id);
                          return (
                            <div key={rating.id} className="bg-black/50 p-4 rounded-lg border border-zinc-700">
                              <div className="flex justify-between items-center mb-3">
                                <p className="font-medium">
                                  {rating.userName || "Anonymous"}
                                </p>
                                <div className="flex items-center gap-1">
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
                                <p className="text-gray-300 mb-4">{rating.review}</p>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleVote(rating.id, 'upvote')}
                                    className={`flex items-center gap-1 ${
                                      userVote === 'upvote' ? 'text-green-400' : 'text-gray-400'
                                    }`}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {rating.upvotes}
                                  </button>
                                  <button
                                    onClick={() => handleVote(rating.id, 'downvote')}
                                    className={`flex items-center gap-1 ${
                                      userVote === 'downvote' ? 'text-red-400' : 'text-gray-400'
                                    }`}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {rating.downvotes}
                                  </button>
                                </div>
                                <p className="text-gray-500">
                                  {new Date(rating.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

               
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => {
                    onSave(movie);
                    setShowDetails(false);
                  }}
                  disabled={!session}
                  className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                    !session
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-[#FF5733] hover:bg-[#e04d2d] text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Add to Favorites
                </button>
                <button
                  onClick={() => {
                    onWatched(movie);
                    setShowDetails(false);
                  }}
                  disabled={!session}
                  className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                    !session
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-[#4CAF50] hover:bg-[#3e8e41] text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
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
