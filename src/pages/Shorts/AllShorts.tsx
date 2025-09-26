import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, Plus, Edit, Trash2, Eye, Play, Filter, Grid, List } from 'lucide-react';
import { fetchShorts } from '../../../store/slices/shortSlice';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:4000/uploads";

export default function ShortsAll() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { shorts, loading, error } = useSelector((state: any) => state.shorts);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'title'>('newest');

  const categories = ['All', 'Sports', 'Politics', 'Business', 'Entertainment', 'Technology'];

  useEffect(() => {
    dispatch(fetchShorts({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleEdit = (id: string) => {
    navigate(`/shorts/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this short?')) {
      // Implement delete logic here
      console.log(`Delete short with id: ${id}`);
    }
  };

  const handleAddNew = () => {
    navigate("/shorts/add-shorts");
  };

  const handlePreview = (id: string) => {
    navigate(`/shorts/preview/${id}`);
  };

  const filteredShorts = shorts
    ?.filter((short: any) =>
      short.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      short.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((short: any) =>
      selectedCategory === '' || selectedCategory === 'All' || short.category === selectedCategory
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    }) || [];

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredShorts.map((short: any) => {
        // Use thumbnailImage and videoImage from API
        const imgUrl = short.thumbnailImage ? `${IMAGE_BASE_URL}/${short.thumbnailImage}` : `${IMAGE_BASE_URL}/default.jpg`;
        return (
          <div key={short._id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => handleEdit(short._id)}>
            <div className="relative">
              <img
                src={imgUrl}
                alt={short.title}
                className="w-full h-48 object-cover"
              />
              {/* Show play icon if videoImage exists */}
              {short.videoImage && (
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
                  {short.status || 'draft'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {typeof short.category === "object" && short.category !== null
                    ? short.category.name
                    : short.category}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {(short.views || 0).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {short.title}
              </h3>
              {/* Slug display */}
              {short.slug && (
                <div className="text-xs text-gray-400 font-mono mb-2">
                  /{short.slug}
                </div>
              )}
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {short.description}
              </p>
              {/* Tags display */}
              {short.tags && short.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {short.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                  {short.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{short.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  {new Date(short.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePreview(short._id); }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(short._id); }}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(short._id); }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tags</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Views</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredShorts.map((short: any) => {
              // Use thumbnailImage and videoImage from API
              const imgUrl = short.thumbnailImage ? `${IMAGE_BASE_URL}/${short.thumbnailImage}` : `${IMAGE_BASE_URL}/default.jpg`;
              return (
                <tr key={short._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(short._id)}>
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-12">
                      <img
                        src={imgUrl}
                        alt={short.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Show play icon if videoImage exists */}
                      {short.videoImage && (
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
                      {short.slug && (
                        <div className="text-xs text-gray-400 font-mono">/{short.slug}</div>
                      )}
                      <div className="text-sm text-gray-500 truncate max-w-xs">{short.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {typeof short.category === "object" && short.category !== null
                        ? short.category.name
                        : short.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {short.tags && short.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {short.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            #{tag}
                          </span>
                        ))}
                        {short.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{short.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No tags</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-gray-400" />
                      {(short.views || 0).toLocaleString()}
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
                        onClick={(e) => { e.stopPropagation(); handlePreview(short._id); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(short._id); }}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(short._id); }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
              {filteredShorts.filter((s: any) => s.status === 'published').length}
            </div>
            <div className="text-green-100">Published</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredShorts.filter((s: any) => s.status === 'draft').length}
            </div>
            <div className="text-yellow-100">Drafts</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredShorts.reduce((sum: number, short: any) => sum + (short.views || 0), 0).toLocaleString()}
            </div>
            <div className="text-purple-100">Total Views</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-red-400 mb-4">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading shorts</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredShorts.length === 0 ? (
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