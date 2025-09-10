import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Eye, Play, Filter, Grid, List } from 'lucide-react';

type ShortType = {
  id: number;
  title: string;
  media: string;
  text: string;
  category: string;
  views: number;
  type: 'image' | 'video';
  createdAt: string;
  status: 'published' | 'draft';
};

const shortsData: ShortType[] = [
  // ... same data as before ...
  { 
    id: 1, 
    title: "Amazing Mountain Adventure", 
    media: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", 
    text: "Exploring the beautiful mountains and their scenic views", 
    category: "Sports", 
    views: 1200,
    type: "image",
    createdAt: "2024-01-15",
    status: "published"
  },
  { 
    id: 2, 
    title: "Political Discussion", 
    media: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca", 
    text: "Latest political developments and their impact", 
    category: "Politics", 
    views: 950,
    type: "video",
    createdAt: "2024-01-14",
    status: "published"
  },
  { 
    id: 3, 
    title: "Business Innovation", 
    media: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43", 
    text: "Revolutionary business strategies for modern companies", 
    category: "Business", 
    views: 2300,
    type: "video",
    createdAt: "2024-01-13",
    status: "draft"
  },
  { 
    id: 4, 
    title: "Entertainment Tonight", 
    media: "https://images.unsplash.com/photo-1489599510795-b908b6e54c84", 
    text: "The latest in entertainment and celebrity news", 
    category: "Entertainment", 
    views: 1800,
    type: "image",
    createdAt: "2024-01-12",
    status: "published"
  },
  { 
    id: 5, 
    title: "Tech Revolution", 
    media: "https://images.unsplash.com/photo-1518709268805-4e9042af2176", 
    text: "Cutting-edge technology trends and innovations", 
    category: "Technology", 
    views: 3200,
    type: "video",
    createdAt: "2024-01-11",
    status: "published"
  }
];

export default function ShortsAll() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'title'>('newest');

  const categories = ['All', 'Sports', 'Politics', 'Business', 'Entertainment', 'Technology'];

  const handleEdit = () => {
    navigate("/shorts/edit");
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this short?')) {
      // Implement delete logic here
      console.log(`Delete short with id: ${id}`);
    }
  };

  const handleAddNew = () => {
    navigate("/shorts/add-shorts");
  };

  const handlePreview = (id: number) => {
    navigate(`/shorts/preview/${id}`);
  };

  const filteredShorts = shortsData
    .filter(short => 
      short.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      short.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(short => 
      selectedCategory === '' || selectedCategory === 'All' || short.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views':
          return b.views - a.views;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredShorts.map((short) => (
        <div key={short.id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={handleEdit}>
          <div className="relative">
            <img 
              src={short.media} 
              alt={short.title}
              className="w-full h-48 object-cover"
            />
            {short.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-60 rounded-full p-3">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                short.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {short.status}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {short.category}
              </span>
              <span className="text-gray-500 text-sm flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {short.views.toLocaleString()}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {short.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {short.text}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">
                {new Date(short.createdAt).toLocaleDateString()}
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handlePreview(short.id); }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(short.id); }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Media</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Views</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredShorts.map((short) => (
              <tr key={short.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleEdit}>
                <td className="px-6 py-4">
                  <div className="relative w-16 h-12">
                    <img 
                      src={short.media} 
                      alt={short.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {short.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-60 rounded-full p-1">
                          <Play className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{short.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{short.text}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {short.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                    {short.views.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    short.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {short.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(short.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePreview(short.id); }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(short.id); }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl  border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">All Shorts</h2>
                <p className="text-blue-100 mt-1">Manage your content library</p>
              </div>
              <button
                onClick={handleAddNew}
                className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Short
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search shorts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'All' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="title">Title A-Z</option>
              </select>

              {/* View Mode */}
              <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">{filteredShorts.length}</div>
            <div className="text-blue-100">Total Shorts</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredShorts.filter(s => s.status === 'published').length}
            </div>
            <div className="text-green-100">Published</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredShorts.filter(s => s.status === 'draft').length}
            </div>
            <div className="text-yellow-100">Drafts</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredShorts.reduce((sum, short) => sum + short.views, 0).toLocaleString()}
            </div>
            <div className="text-purple-100">Total Views</div>
          </div>
        </div>

        {/* Content */}
        {filteredShorts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No shorts found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <GridView /> : <ListView />}
          </>
        )}
      </div>
    </div>
  );
}