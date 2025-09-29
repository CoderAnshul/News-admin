import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCities, createCity, updateCity, deleteCity } from '../../../store/slices/citySlice'
import { fetchStates } from '../../../store/slices/State'
import { RootState, AppDispatch } from '../../../store/slices/store'
import { Search, Filter, Grid, List, Plus, Edit, Trash2, X, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

const City = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cities, loading, error, pagination } = useSelector((state: RootState) => state.city);
  const { states: stateList } = useSelector((state: RootState) => state.state);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [formData, setFormData] = useState<{ name: string; state: string; country: string; description: string; status: "active" | "inactive" }>({
    name: "",
    state: "",
    country: "",
    description: "",
    status: "active"
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const limit = pagination?.limit || 10;
  const pages = pagination?.pages || 1;
  const total = pagination?.total || cities.length;

  useEffect(() => {
    dispatch(fetchCities({ page, limit }) as any);
    dispatch(fetchStates({ page: 1, limit: 100 }) as any); // fetch all states for dropdown
  }, [dispatch, page, limit]);

  const statusOptions = ['All', 'active', 'inactive'];

  const filteredCities = cities
    ?.filter((city) =>
      city.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.state?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((city) =>
      selectedStatus === '' || selectedStatus === 'All' || city.status === selectedStatus
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

  // Modal handlers
  const openAddModal = () => {
    setEditingCity(null);
    setFormData({ name: "", state: "", country: "", description: "", status: "active" });
    setShowModal(true);
  };

  const openEditModal = (city: any) => {
    setEditingCity(city);
    setFormData({
      name: city.name || "",
      state: typeof city.state === "object" && city.state !== null ? city.state._id : city.state || "",
      country: city.country || "",
      description: city.description || "",
      status: city.status || "active"
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCity(null);
    setFormData({ name: "", state: "", country: "", description: "", status: "active" });
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked ? "active" : "inactive" : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.state.trim() || !formData.country.trim()) return;

    if (editingCity) {
      await dispatch(updateCity({ id: editingCity._id, data: formData }) as any);
    } else {
      await dispatch(createCity(formData) as any);
    }
    closeModal();
    dispatch(fetchCities({ page, limit }) as any);
  };

  // Delete handlers
  const handleDelete = (city: any) => {
    setCityToDelete(city);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (cityToDelete) {
      await dispatch(deleteCity(cityToDelete._id) as any);
      setDeleteModalOpen(false);
      setCityToDelete(null);
      dispatch(fetchCities({ page, limit }) as any);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCityToDelete(null);
  };

  // UI
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCities.map((city) => (
        <div key={city._id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {typeof city.country === "object" && city.country !== null
                  ? city.country.name
                  : city.country || 'N/A'}
              </span>
              <span className="text-gray-500 text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {typeof city.state === "object" && city.state !== null
                  ? city.state.name
                  : city.state || ''}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {city.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {typeof city.description === "object" && city.description !== null
                ? JSON.stringify(city.description)
                : city.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">
                {city.createdAt ? new Date(city.createdAt).toLocaleDateString() : "-"}
              </span>
              <div className="flex space-x-2">
                <button
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                  title="Edit"
                  onClick={() => openEditModal(city)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                  onClick={() => handleDelete(city)}
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">State</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Country</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCities.map((city) => (
              <tr key={city._id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-medium text-gray-900">{city.name}</td>
                <td className="px-6 py-4 text-gray-700">
                  {typeof city.state === "object" && city.state !== null
                    ? city.state.name
                    : city.state}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {typeof city.country === "object" && city.country !== null
                    ? city.country.name
                    : city.country}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {typeof city.description === "object" && city.description !== null
                    ? JSON.stringify(city.description)
                    : city.description}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    city.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {city.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {city.createdAt ? new Date(city.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Edit"
                      onClick={() => openEditModal(city)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                      onClick={() => handleDelete(city)}
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
                <h2 className="text-2xl font-bold text-white">All Cities</h2>
                <p className="text-blue-100 mt-1">Manage your cities library</p>
              </div>
              <button
                className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center"
                onClick={openAddModal}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New City
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
                  placeholder="Search cities..."
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
            <div className="text-2xl font-bold">{filteredCities.length}</div>
            <div className="text-blue-100">Total Cities</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredCities.filter((c) => c.status === 'active').length}
            </div>
            <div className="text-green-100">Active</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredCities.filter((c) => c.status === 'inactive').length}
            </div>
            <div className="text-yellow-100">Inactive</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredCities.reduce((sum, c) => sum + (c.description ? 1 : 0), 0)}
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
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading cities</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No cities found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <GridView /> : <ListView />}
          </>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex rounded-lg px-2 py-1 space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1 flex items-center text-lg font-semibold text-gray-900 min-w-[40px] justify-center">
              {page}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit City */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100005]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                {editingCity ? "Edit City" : "Add New City"}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {stateList.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., India"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the city"
                    rows={3}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.status === "active"}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    City is active
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingCity ? "Update" : "Add"} City
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && cityToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100010]">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Delete City
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{cityToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
            <button
              onClick={cancelDelete}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default City
