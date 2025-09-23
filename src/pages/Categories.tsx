import { Plus, Trash2, Edit3, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/slices/store";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../store/slices/category";

interface Category {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
  // ...other fields as needed...
}

export default function Categories() {
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const { categories: categoriesRaw, loading, error, pagination } = useSelector((state: RootState) => state.category);
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const [page, setPage] = useState<number>(1);
  const limit = pagination?.limit || 10;
  const total = pagination?.total || categories.length;
  const pages = pagination?.pages || 1;

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [formData, setFormData] = useState<{ name: string; description: string; color: string; status: "active" | "inactive" }>(
    { name: "", description: "", color: "#3B82F6", status: "active" }
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const colorOptions = [
    { value: "#3B82F6", name: "Blue" },
    { value: "#10B981", name: "Green" },
    { value: "#F59E0B", name: "Yellow" },
    { value: "#EF4444", name: "Red" },
    { value: "#8B5CF6", name: "Purple" },
    { value: "#F97316", name: "Orange" },
    { value: "#06B6D4", name: "Cyan" },
    { value: "#84CC16", name: "Lime" },
    { value: "#EC4899", name: "Pink" },
    { value: "#6B7280", name: "Gray" }
  ];

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Get parent category name
  const getParentCategoryName = (parentId?: string): string => {
    if (!parentId) return "";
    const parent = categories.find(cat => cat._id === parentId);
    return parent ? parent.name : "";
  };

  // Get available parent categories (excluding current category when editing)
  const getAvailableParentCategories = (): Category[] => {
    return categories.filter(cat =>
      cat._id !== editingCategory?._id &&
      !cat.parentId // Only show top-level categories as potential parents
    );
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    getParentCategoryName(category.parentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: FormEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      // Dispatch updateCategory thunk
      await dispatch(updateCategory({
        id: editingCategory._id,
        data: {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          status: formData.status,
        }
      }));
    } else {
      // Dispatch createCategory thunk
      await dispatch(createCategory({
        name: formData.name,
        description: formData.description,
        color: formData.color,
        status: formData.status,
      }));
    }

    setFormData({ name: "", description: "", color: "#3B82F6", status: "active" });
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      description: category.description || "", 
      color: category.color || "#3B82F6",
      status: category.status || "active"
    });
    setShowModal(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await dispatch(deleteCategory(categoryToDelete._id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      // Refresh the list after delete
      dispatch(fetchCategories({ page, limit }));
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "#3B82F6", status: "active" });
  };

  // Auto-generate slug when name changes
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name) // Only auto-generate if slug is empty
    }));
  };

  useEffect(() => {
    dispatch(fetchCategories({ page, limit }));
  }, [dispatch, page, limit]);

  return (
    <div className="g-gray-50 min-h-screen dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        
         

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and organize your news categories
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between">
  {/* Search box */}
  <div className="relative max-w-md flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Search categories..."
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

</div>


        {/* Categories Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 whitespace-nowrap dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? "No categories found matching your search." : "No categories created yet."}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, idx) => (
                    <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {category.description || "No description"}
                        </div>
                      </td>
                        <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          category.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {category.status === "active" ? "Active" : "Inactive"}
                        </span>
                        </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete category"
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

        {/* Stats */}
        {/* <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Categories
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {categories.reduce((sum, cat) => sum + cat.articles, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Articles
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(categories.reduce((sum, cat) => sum + cat.articles, 0) / categories.length) || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Articles/Category
            </div>
          </div>
        </div> */}

        {/* Pagination Controls */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex  rounded-lg  px-2 py-1 space-x-2">
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100010]">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-lg p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Delete Category
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{categoryToDelete.name}</span>? This action cannot be undone.
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100005]">
          <div className="bg-white max-h-[500px] overflow-y-scroll hide-scrollbar dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 relative">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h2>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter category name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Color *
                  </label>
                  <div className="space-y-3">
                    {/* Color Picker Input */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color.toUpperCase()}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                            setFormData({ ...formData, color: value });
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                        placeholder="#3B82F6"
                        maxLength={7}
                      />
                    </div>
                    
                    {/* Quick Color Presets */}
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Quick presets:</span>
                      <div className="grid grid-cols-10 gap-1">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: color.value })}
                            className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                              formData.color.toUpperCase() === color.value.toUpperCase()
                                ? 'border-gray-800 dark:border-white' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end  z-10 bg-white w-full space-x-3">
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
                    {editingCategory ? "Update" : "Create"} Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}