const Nav = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0">
              <a href="/" className="text-blue-500 font-bold text-xl">Stream Hive</a>
            </div>
            <div className="hidden md:block ml-auto">
              <div className="flex space-x-4">
                <a href="/" className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-lg text-sm font-medium transition duration-200">Videos</a>
                <a href="/profile" className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-lg text-sm font-medium transition duration-200">Profile</a>
                <a href="/file-upload" className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-lg text-sm font-medium transition duration-200">Upload Video</a>
                <a href="/login" className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-lg text-sm font-medium transition duration-200">Login Page</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;