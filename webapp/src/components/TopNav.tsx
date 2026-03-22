import { NavLink } from 'react-router-dom';

export default function TopNav() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 w-full fixed top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* App Brand/Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-blue-400">EfficiencyTracker</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-2 sm:space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-inner' // Active state styling
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Inactive state styling
                }`
              }
            >
              Live Tracker
            </NavLink>
            
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-inner'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              Trip History
            </NavLink>
          </div>

        </div>
      </div>
    </nav>
  );
}