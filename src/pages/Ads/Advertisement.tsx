import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, Plus, Edit, Trash2, Eye, Filter, Grid, List, X, ExternalLink, Clock, MapPin, Tag, DollarSign, Calendar, IndianRupee } from 'lucide-react';
import { fetchAdvertisements, fetchAdvertisementById, deleteAdvertisement } from '../../../store/slices/advertisement';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:4000/uploads";

export default function Advertisement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ads, loading, error } = useSelector((state: any) => state.advertisement);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'title'>('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalAd, setModalAd] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const statusOptions = ['All', 'active', 'inactive'];

  useEffect(() => {
    dispatch(fetchAdvertisements());
  }, [dispatch]);

  const handleEdit = (id: string) => {
    navigate(`/ads/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const res: any = await dispatch(deleteAdvertisement(deleteId));
      if (res.meta && res.meta.requestStatus === "fulfilled") {
        setDeleteSuccess("Advertisement deleted successfully.");
        dispatch(fetchAdvertisements());
      } else {
        setDeleteError(res.error?.message || "Failed to delete advertisement");
      }
    } catch (e: any) {
      setDeleteError(e?.message || "Failed to delete advertisement");
    }
    setDeleteLoading(false);
    setDeleteId(null);
    setTimeout(() => {
      setDeleteSuccess(null);
      setDeleteError(null);
    }, 2000);
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleAddNew = () => {
    // Implement navigation to add new advertisement
    console.log('Navigate to add new advertisement');
  };

  const handlePreview = async (id: string) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalAd(null);
    try {
      const res: any = await dispatch(fetchAdvertisementById(id));
      if (res.payload) setModalAd(res.payload);
      else setModalError("Failed to fetch advertisement");
    } catch (e: any) {
      setModalError(e?.message || "Error loading advertisement");
    }
    setModalLoading(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAd(null);
    setModalError(null);
  };

  const filteredAds = ads
    ?.filter((ad: any) =>
      ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((ad: any) =>
      selectedStatus === '' || selectedStatus === 'All' || ad.status === selectedStatus
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views':
          return (b.viewsAllowed || 0) - (a.viewsAllowed || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    }) || [];

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredAds.map((ad: any) => {
        const imgUrl = ad.media ? `${IMAGE_BASE_URL}/${ad.media}` : `${IMAGE_BASE_URL}/default.jpg`;
        return (
          <div key={ad._id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => handleEdit(ad._id)}>
            <div className="relative">
              <img
                src={imgUrl}
                alt={ad.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {ad.status || 'inactive'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {ad.placementLocation || 'N/A'}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {(ad.viewsAllowed || 0).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {ad.title}
              </h3>
              {/* Slug display */}
              {ad.slug && (
                <div className="text-xs text-gray-400 font-mono mb-2">
                  /{ad.slug}
                </div>
              )}
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {ad.description}
              </p>
              {/* Tags display */}
              {ad.tags && ad.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {ad.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                  {ad.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{ad.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  {new Date(ad.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePreview(ad._id); }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(ad._id); }}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(ad._id); }}
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Placement</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tags</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Views Allowed</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAds.map((ad: any) => {
              const imgUrl = ad.media ? `${IMAGE_BASE_URL}/${ad.media}` : `${IMAGE_BASE_URL}/default.jpg`;
              return (
                <tr key={ad._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(ad._id)}>
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-12">
                      <img
                        src={imgUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{ad.title}</div>
                      {ad.slug && (
                        <div className="text-xs text-gray-400 font-mono">/{ad.slug}</div>
                      )}
                      <div className="text-sm text-gray-500 truncate max-w-xs">{ad.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {ad.placementLocation || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ad.tags && ad.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {ad.tags.slice(0, 2).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            #{tag}
                          </span>
                        ))}
                        {ad.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{ad.tags.length - 2} more
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
                      {(ad.viewsAllowed || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreview(ad._id); }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(ad._id); }}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(ad._id); }}
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

  // Enhanced modal UI helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'paused':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getProgressPercentage = () => {
    if (!modalAd?.viewsAllowed) return 0;
    return Math.min(((modalAd.viewsConsumed || 0) / modalAd.viewsAllowed) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl  border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">All Advertisements</h2>
                <p className="text-blue-100 mt-1">Manage your advertisement library</p>
              </div>
              <button
                onClick={handleAddNew}
                className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Advertisement
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
                  placeholder="Search advertisements..."
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
                <option value="views">Most Views Allowed</option>
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
            <div className="text-2xl font-bold">{filteredAds.length}</div>
            <div className="text-blue-100">Total Ads</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredAds.filter((a: any) => a.status === 'active').length}
            </div>
            <div className="text-green-100">Active</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredAds.filter((a: any) => a.status === 'inactive').length}
            </div>
            <div className="text-yellow-100">Inactive</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-2xl font-bold">
              {filteredAds.reduce((sum: number, ad: any) => sum + (ad.viewsAllowed || 0), 0).toLocaleString()}
            </div>
            <div className="text-purple-100">Total Views Allowed</div>
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
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading advertisements</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No advertisements found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <GridView /> : <ListView />}
          </>
        )}

        {/* Enhanced Modal for ad preview */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={closeModal}
            />
            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-4">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 group"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                </button>
                <div className="pr-12">
                  <h2 className="text-2xl font-bold mb-2">Ad Campaign Details</h2>
                  <p className="text-blue-100">Comprehensive overview and analytics</p>
                </div>
              </div>
              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                {modalLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-blue-100"></div>
                      <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent absolute top-0 animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading ad details...</p>
                  </div>
                ) : modalError ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <X className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-medium text-center">{modalError}</p>
                    <button
                      onClick={() => setModalError(null)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                ) : modalAd ? (
                  <div className="p-6 space-y-6">
                    {/* Ad Preview Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border">
                      <div className="flex items-start gap-6">
                        <div className="relative group">
                          <img
                            src={modalAd.media ? `${IMAGE_BASE_URL}/${modalAd.media}` : `${IMAGE_BASE_URL}/default.jpg`}
                            alt={modalAd.title}
                            className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{modalAd.title}</h3>
                            <p className="text-sm text-gray-500 font-mono bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                              /{modalAd.slug}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(modalAd.status)}`}>
                              {modalAd.status?.charAt(0).toUpperCase() + modalAd.status?.slice(1)}
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                              {modalAd.placementLocation || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="bg-white border rounded-xl p-5">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Description
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{modalAd.description}</p>
                    </div>
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-green-600 font-medium">Views Progress</p>
                            <p className="text-lg font-bold text-green-900">
                              {(modalAd.viewsConsumed ?? 0).toLocaleString()} / {(modalAd.viewsAllowed ?? 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-green-600 mt-1">{getProgressPercentage().toFixed(1)}% consumed</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <IndianRupee className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Amount Paid (₹)</p>
                            <p className="text-lg font-bold text-blue-900">{modalAd.amountPaid ?? 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Detailed Information */}
                    <div className="space-y-4">
                      {/* Destination Link */}
                      <div className="bg-white border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ExternalLink className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">Destination Link</span>
                        </div>
                        <a
                          href={modalAd.destinationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all text-sm transition-colors duration-200"
                        >
                          {modalAd.destinationLink}
                        </a>
                      </div>
                      {/* Category */}
                      <div className="bg-white border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: modalAd.category?.color || "#6B7280" }}></div>
                          <span className="font-semibold text-gray-900">Category</span>
                        </div>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: modalAd.category?.color || "#6B7280" }}
                        >
                          {typeof modalAd.category === "object" && modalAd.category !== null
                            ? modalAd.category.name
                            : modalAd.category}
                        </span>
                      </div>
                      {/* Cities */}
                      <div className="bg-white border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">Target Cities</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(modalAd.cities) && modalAd.cities.length > 0
                            ? modalAd.cities.map((city: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                  {city}
                                </span>
                              ))
                            : <span className="text-gray-400 text-sm">No cities specified</span>}
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="bg-white border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {modalAd.tags && modalAd.tags.length > 0 ?
                            modalAd.tags.map((tag: string, idx: number) => (
                              <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                #{tag}
                              </span>
                            )) :
                            <span className="text-gray-400 text-sm">No tags</span>
                          }
                        </div>
                      </div>
                      {/* Timestamps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">Created</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {modalAd.createdAt ? formatDate(modalAd.createdAt) : "N/A"}
                          </p>
                        </div>
                        <div className="bg-white border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {modalAd.updatedAt ? formatDate(modalAd.updatedAt) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelDelete} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center">
              <X className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900">Delete Advertisement?</h3>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to delete this advertisement? This action cannot be undone.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete feedback */}
        {(deleteLoading || deleteError || deleteSuccess) && (
          <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
            <div className={`px-6 py-3 rounded-xl shadow-lg font-semibold text-center transition-all
              ${deleteLoading ? "bg-blue-600 text-white" : ""}
              ${deleteError ? "bg-red-100 text-red-700" : ""}
              ${deleteSuccess ? "bg-green-100 text-green-700" : ""}
            `}>
              {deleteLoading && "Deleting..."}
              {deleteError && deleteError}
              {deleteSuccess && deleteSuccess}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
