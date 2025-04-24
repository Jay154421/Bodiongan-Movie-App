import { useSearch } from "./SearchContext";

const categories = [
  { key: "now_playing", label: "Now Playing" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
];

const CategorySelector = () => {
  const { selectedCategory, fetchCategoryMovies } = useSearch();

  return (
    <div className="flex justify-center gap-4 mb-8">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => fetchCategoryMovies(cat.key)}
          className={`px-4 py-2 rounded-full font-medium transition ${
            selectedCategory === cat.key
              ? "bg-[#00BFFF] text-white"
              : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;
