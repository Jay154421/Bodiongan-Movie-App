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
          className="px-4 py-2 bg-[#FF5733] text-white rounded-lg hover:bg-[#c44427] transition"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
