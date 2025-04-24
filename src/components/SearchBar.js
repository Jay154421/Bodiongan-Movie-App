import React, { useState } from "react";
import { useSearch } from "./SearchContext";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const { searchMovies } = useSearch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchMovies(query);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 m-6 w-full flex-col">
      <div className="flex flex-col mb-4">
        <h2 className="text-5xl font-bold">Welcome.</h2>
        <h3 className="text-3xl font-semibold">
          Millions of movies to explore.
        </h3>
      </div>
      <div className="flex gap-2 items-center w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          className="flex-1 p-2 border border-gray-500 text-black rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#009acd] transition"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
