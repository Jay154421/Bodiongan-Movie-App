import { useSearch } from "./SearchContext";

const categories = [
  { key: "now_playing", label: "Now Playing" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
];

const CategorySelector = () => {
  const { selectedCategory, fetchCategoryMovies } = useSearch();

  return (
    <div className="flex justify-center gap-4 mb-8 relative">
      {/* Film reel effect */}
      <div className="absolute -bottom-4 left-0 right-0 h-2 bg-[url('https://www.transparenttextures.com/patterns/film-strip.png')] bg-repeat-x opacity-20"></div>

      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => fetchCategoryMovies(cat.key)}
          className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
            selectedCategory === cat.key
              ? "bg-gradient-to-r from-[#00BFFF] to-[#FF5733] text-white shadow-lg shadow-[#00BFFF]/30"
              : "bg-black text-gray-300 hover:bg-gray-900 border border-gray-800"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;
