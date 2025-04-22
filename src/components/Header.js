

function Header(onSignOut){
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold">Movie Explorer</h1>
        <button
          onClick={onSignOut}
          className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </div>
    );
    
}

export default Header;