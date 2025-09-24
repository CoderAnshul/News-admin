import { Plus, Trash2, Edit3, Search, MapPin, Globe, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/slices/store";
import { fetchLocations, createLocation, updateLocation, deleteLocation } from "../../store/slices/locations";

interface Location {
  _id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt?: string;
}

export default function Locations() {
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const { locations: locationsRaw, loading, error, pagination } = useSelector((state: RootState) => state.location);
  const locations: Location[] = Array.isArray(locationsRaw) ? locationsRaw : [];
  const [page, setPage] = useState<number>(1);
  const limit = pagination?.limit || 10;
  const pages = pagination?.pages || 1;
  const total = pagination?.total || locations.length;

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [formData, setFormData] = useState<{ name: string; country: string; region: string; description: string; status: "active" | "inactive" }>(
    { name: "", country: "", region: "", description: "", status: "active" }
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  useEffect(() => {
    dispatch(fetchLocations({ page, limit }));
  }, [dispatch, page, limit]);

  // Filtered locations (search and region)
  const filteredLocations = locations.filter(location => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.country || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === "all" || location.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  const handleSubmit = async (e: FormEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim() || !formData.region.trim()) return;

    if (editingLocation) {
      await dispatch(updateLocation({
        id: editingLocation._id,
        data: {
          name: formData.name,
          country: formData.country,
          region: formData.region,
          description: formData.description,
          status: formData.status,
        }
      }));
    } else {
      await dispatch(createLocation({
        name: formData.name,
        country: formData.country,
        region: formData.region,
        description: formData.description,
        status: formData.status,
      }));
    }

    setFormData({ name: "", country: "", region: "", description: "", status: "active" });
    setShowModal(false);
    setEditingLocation(null);
    dispatch(fetchLocations({ page, limit }));
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      country: location.country,
      region: location.region,
      description: location.description,
      status: location.status
    });
    setShowModal(true);
  };

  const handleDelete = (location: Location) => {
    setLocationToDelete(location);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (locationToDelete) {
      await dispatch(deleteLocation(locationToDelete._id));
      setDeleteModalOpen(false);
      setLocationToDelete(null);
      dispatch(fetchLocations({ page, limit }));
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setLocationToDelete(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData({ name: "", country: "", region: "", description: "", status: "active" });
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Globe className="w-8 h-8 mr-3 text-blue-600" />
              Manage Locations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add and manage locations where you deliver news coverage
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Location
          </button>
        </div>

          {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {locations.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Locations
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {locations.filter(loc => loc.status === "active").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Locations
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(locations.map(loc => loc.region)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Regions Covered
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {locations.reduce((sum, loc) => sum + loc.articles, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Articles
            </div>
          </div>
        </div>


        {/* Search and Filter Bar */}
        <div className="mb-6 flex items-center justify-between mt-10">
          {/* Search box */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search locations, countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          {/* Total box */}
          <div className="bg-transparent p-2 w-32 text-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Total : <span className="text-lg font-semibold text-gray-900 dark:text-white">{total}</span>
            </div>
          </div>
          {/* Region filter */}
          {/* <input
            type="text"
            value={filterRegion === "all" ? "" : filterRegion}
            onChange={(e) => setFilterRegion(e.target.value || "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ml-4"
            placeholder="Filter by region"
          /> */}
        </div>

        {/* Locations Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || filterRegion !== "all" ? "No locations found matching your filters." : "No locations created yet."}
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((location) => (
                    <tr key={location._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {location.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {location.country}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {location.region}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {location.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          location.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}>
                          {location.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(location)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit location"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(location)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete location"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      
        {/* Pagination Controls */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex rounded-lg px-2 py-1 space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 flex items-center"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1 flex items-center text-lg font-semibold text-gray-900 dark:text-white min-w-[40px] justify-center">
              {page}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 flex items-center"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100005]">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., United States"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region *
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe the coverage area and scope"
                    rows={3}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.status === "active"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "active" : "inactive" })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Location is active for news coverage
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingLocation ? "Update" : "Add"} Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && locationToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100010]">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-lg p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Delete Location
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{locationToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}