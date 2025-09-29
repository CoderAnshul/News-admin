import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStates } from '../../../store/slices/State'
import { RootState, AppDispatch } from '../../../store/slices'
import { Search, Filter, Grid, List, Plus, Edit, Trash2, Eye, X, Calendar, MapPin } from 'lucide-react'


const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:4000/uploads";

const State = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { states, loading, error, pagination } = useSelector((state: RootState) => state.state);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  useEffect(() => {
    dispatch(fetchStates({ page: 1, limit: 10 }) as any);
  }, [dispatch]);

  const statusOptions = ['All', 'active', 'inactive'];

  const filteredStates = states
    ?.filter((state) =>
      state.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.country?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((state) =>
      selectedStatus === '' || selectedStatus === 'All' || state.status === selectedStatus
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'oldest':
          return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    }) || [];

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredStates.map((state) => (
        <div key={state._id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="relative">
            <img
              src={state.image ? `${IMAGE_BASE_URL}/${state.image}` : `${IMAGE_BASE_URL}/default.jpg`}
              alt={state.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                state.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {state.status || 'inactive'}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {state.country || 'N/A'}
              </span>
              <span className="text-gray-500 text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {state.description || ''}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {state.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {state.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">
                {state.createdAt ? new Date(state.createdAt).toLocaleDateString() : "-"}
              </span>
              <div className="flex space-x-2">
                <button
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Country</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStates.map((state) => (
              <tr key={state._id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <img
                    src={state.image ? `${IMAGE_BASE_URL}/${state.image}` : `${IMAGE_BASE_URL}/default.jpg`}
                    alt={state.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{state.name}</td>
                <td className="px-6 py-4 text-gray-700">{state.country}</td>
                <td className="px-6 py-4 text-gray-700">{state.description}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    state.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {state.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {state.createdAt ? new Date(state.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
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
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">All States</h2>
                <p className="text-blue-100 mt-1">Manage your states library</p>
              </div>
              <button
                className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New State
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
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status === 'All' ? '' : status}>
                      {status}
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
                <option value="name">Name A-Z</option>
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
            <div className="text-2xl font-bold">{filteredStates.length}</div>
            <div className="text-blue-100">Total States</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredStates.filter((s) => s.status === 'active').length}
            </div>
            <div className="text-green-100">Active</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredStates.filter((s) => s.status === 'inactive').length}
            </div>
            <div className="text-yellow-100">Inactive</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredStates.reduce((sum, s) => sum + (s.description ? 1 : 0), 0)}
            </div>
            <div className="text-purple-100">With Description</div>
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
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading states</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredStates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No states found</h3>
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
  )
}

export default State
