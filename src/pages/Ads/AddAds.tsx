import { Upload, Link as LinkIcon, Type, Eye, Save, ImageIcon, X, MapPin, Hash, Edit, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

interface AdFormData {
  id?: number;
  title: string;
  imageUrl: string;
  link: string;
  description: string;
  location: string;
  slug: string;
  tags: string[];
  amountPaid?: number;      // Add amount paid
  clicksAllowed?: number;   // Add clicks allowed
  categories?: string[]; // Add categories field
  city?: string | string[]; // allow string[] for multi-select
}

interface Advertisement extends AdFormData {
  id: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export default function AddAds() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine initial view based on URL
  const getInitialView = (): 'create' | 'manage' => {
    return location.pathname === '/ads/manage' ? 'manage' : 'create';
  };

  const [currentView, setCurrentView] = useState<'create' | 'manage'>(getInitialView());
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  
  const [formData, setFormData] = useState<AdFormData>({
    title: "",
    imageUrl: "",
    link: "",
    description: "",
    location: "",
    slug: "",
    tags: [],
    amountPaid: undefined,      // Add to initial state
    clicksAllowed: undefined,   // Add to initial state
    categories: [], // for multi-select
    city: [], // default to empty array for multi-select
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>("");
  const [showTagSuggestions, setShowTagSuggestions] = useState<boolean>(false);

  const locationOptions = [
    { value: "", label: "Select Ad Placement Location" },
    { value: "home-banner", label: "Homepage Top Banner" },
    { value: "between-paragraph", label: "Article Inline (Between Paragraphs)" },
    { value: "sidebar", label: "Sidebar Advertisement" },
    { value: "footer", label: "Footer Banner" },
    { value: "popup", label: "Popup Advertisement" }
  ];

  const cityLocations = [
    { value: "bikaner", label: "Bikaner" },
    { value: "jaipur", label: "Jaipur" },
    { value: "delhi", label: "Delhi" },
  ];

  const predefinedTags = [
    "banner", "popup", "sidebar", "sponsored", "promotion", "sale", "discount", 
    "new", "featured", "trending", "limited-time", "exclusive", "offer",
    "product", "service", "brand", "campaign", "marketing", "digital",
    "mobile", "desktop", "responsive", "clickable", "interactive"
  ];

  const allCategories = [
    "Technology",
    "Sports",
    "Politics",
    "Business",
    "Health",
    "Entertainment",
    "Science",
    "Travel",
  ];

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Tag management functions
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length) {
      const lastTag = formData.tags[formData.tags.length - 1];
      removeTag(lastTag);
    }
  };

  const getFilteredTagSuggestions = () => {
    if (!tagInput) return [];
    return predefinedTags
      .filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !formData.tags.includes(tag)
      )
      .slice(0, 6);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === "categories") {
      // Multi-select for categories
      const options = (e.target as HTMLSelectElement).options;
      const selected: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) selected.push(options[i].value);
      }
      setFormData(prev => ({
        ...prev,
        categories: selected,
      }));
      return;
    }
    if (name === "city") {
      // Multi-select for cities
      const options = (e.target as HTMLSelectElement).options;
      const selected: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) selected.push(options[i].value);
      }
      setFormData(prev => ({
        ...prev,
        city: selected,
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? undefined : Number(value)) : value,
      // Auto-generate slug when title changes
      ...(name === 'title' ? { slug: prev.slug || generateSlug(value) } : {})
    }));
    if (name === 'imageUrl' && value) {
      setImagePreview(value);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (editingAd) {
      // Update existing ad
      setAdvertisements(prev => prev.map(ad => 
        ad.id === editingAd.id 
          ? { ...ad, ...formData, id: editingAd.id, categories: formData.categories || [] }
          : ad
      ));
      alert("Advertisement updated successfully!");
    } else {
      // Create new ad
      const newAd: Advertisement = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'active',
        categories: formData.categories || [],
      };
      setAdvertisements(prev => [...prev, newAd]);
      alert("Advertisement created successfully!");
    }
    
    // Reset form and switch to manage view
    resetForm();
    setCurrentView('manage');
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({ title: "", imageUrl: "", link: "", description: "", location: "", slug: "", tags: [], amountPaid: undefined, clicksAllowed: undefined, categories: [], city: [] });
    setImagePreview(null);
    setEditingAd(null);
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      ...ad,
      categories: ad.categories || [],
    });
    setImagePreview(ad.imageUrl);
    setCurrentView('create');
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      setAdvertisements(prev => prev.filter(ad => ad.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setAdvertisements(prev => prev.map(ad => 
      ad.id === id 
        ? { ...ad, status: ad.status === 'active' ? 'inactive' : 'active' }
        : ad
    ));
  };

  const clearImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleView = (id: number) => {
    navigate(`/ads/view/${id}`);
  };

  // Update view when URL changes
  useEffect(() => {
    const newView = getInitialView();
    setCurrentView(newView);
  }, [location.pathname]);

  if (currentView === 'manage') {
    return (
      <div className="min-h-screen">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manage Advertisements
              </h1>
              <p className="text-gray-600">
                View, edit, and manage your advertisements
              </p>
            </div>
            <button
              onClick={() => navigate('/ads/add')}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5 mr-2" />
              Create New Ad
            </button>
          </div>

          {advertisements.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="text-center py-16 px-8">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Advertisements Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't created any advertisements yet. Start by creating your first advertisement to reach your audience effectively.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/ads/add')}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Ad
                  </button>
                </div>
                
                {/* Tips for getting started */}
                <div className="mt-12 bg-gray-50 rounded-xl p-6 text-left">
                  <h4 className="font-semibold text-gray-800 mb-4">💡 Getting Started Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Create eye-catching advertisements with high-quality images
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Choose strategic placement locations for maximum visibility
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Use compelling titles and clear call-to-action text
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Organize your ads with tags for better management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Advertisements Table */
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Advertisement
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {advertisements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No advertisements created yet.
                        </td>
                      </tr>
                    ) : (
                      advertisements.map((ad) => (
                        <tr key={ad.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {ad.imageUrl && (
                                <img 
                                  src={ad.imageUrl} 
                                  alt={ad.title}
                                  className="w-16 h-12 object-cover rounded mr-4"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                                <div className="text-sm text-gray-500 font-mono">/{ad.slug}</div>
                                {ad.description && (
                                  <div className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-xs">
                                    {ad.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {locationOptions.find(opt => opt.value === ad.location)?.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {ad.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {ad.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
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
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleStatus(ad.id)}
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                ad.status === 'active'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {ad.status}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleView(ad.id)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="View advertisement"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(ad)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit advertisement"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(ad.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete advertisement"
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          {advertisements.length > 0 && (
            <button
              onClick={() => navigate('/ads/manage')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to manage ads"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {editingAd ? 'Edit Advertisement' : 'Create Advertisement'}
            </h1>
            <p className="text-gray-600">
              {editingAd ? 'Update your advertisement details' : 'Design and create engaging advertisements'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-3xl  p-8 border border-gray-100">
            <div className="space-y-6">
              {/* Ad Title */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Type className="w-4 h-4 mr-2 text-indigo-500" />
                  Advertisement Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a compelling title..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <LinkIcon className="w-4 h-4 mr-2 text-indigo-500" />
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="ad-slug"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  URL-friendly version of the title. Auto-generated if left empty.
                </p>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Hash className="w-4 h-4 mr-2 text-indigo-500" />
                  Tags
                </label>
                
                {/* Selected Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(e.target.value.length > 0);
                    }}
                    onKeyDown={handleTagInputKeyDown}
                    onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                    placeholder="Type tags and press Enter..."
                  />
                  
                  {/* Tag Suggestions */}
                  {showTagSuggestions && getFilteredTagSuggestions().length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {getFilteredTagSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addTag(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0"
                        >
                          #{suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Type className="w-4 h-4 mr-2 text-indigo-500" />
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your advertisement..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Upload className="w-4 h-4 mr-2 text-indigo-500" />
                  Advertisement Media
                </label>
                
                <div className="space-y-4">
                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="imageUpload"
                    />
                    <label 
                      htmlFor="imageUpload"
                      className="flex items-center justify-center w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 cursor-pointer transition-colors duration-200 bg-gray-50 hover:bg-indigo-50"
                    >
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">Click to upload image</span>
                    </label>
                  </div>

                  {/* Or URL Input */}
                  <div className="relative">
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="Or enter image URL..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Ad Link */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <LinkIcon className="w-4 h-4 mr-2 text-indigo-500" />
                  Destination Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                  required
                />
              </div>

              {/* Location Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                  Ad Placement Location
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                  required
                >
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi City Location Selector */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                  Select Cities
                </label>
                <select
                  name="city"
                  multiple
                  value={Array.isArray(formData.city) ? formData.city : []}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                  style={{ minHeight: "3.5rem" }}
                >
                  {cityLocations.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple cities.
                </p>
              </div>

              {/* Amount Paid */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid ?? ""}
                  onChange={handleInputChange}
                  min={0}
                  step={1}
                  placeholder="Enter amount paid (in rupees)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                />
              </div>

              {/* Clicks Allowed */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  Views Allowed
                </label>
                <input
                  type="number"
                  name="clicksAllowed"
                  value={formData.clicksAllowed ?? ""}
                  onChange={handleInputChange}
                  min={1}
                  step={1}
                  placeholder="Enter number of allowed clicks"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-gray-700"
                />
              </div>

              {/* Category Checkbox Group */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Hash className="w-4 h-4 mr-2 text-indigo-500" />
                  Select Categories
                </label>
                <div className="flex flex-wrap gap-3">
                  {allCategories.map(cat => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="categories"
                        value={cat}
                        checked={formData.categories?.includes(cat)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            categories: checked
                              ? [...(prev.categories || []), cat]
                              : (prev.categories || []).filter(c => c !== cat)
                          }));
                        }}
                        className="accent-indigo-500 w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-gray-700 text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Select one or more categories for this advertisement.
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.link || !formData.location}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editingAd ? 'Updating Advertisement...' : 'Creating Advertisement...'}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    {editingAd ? 'Update Advertisement' : 'Create Advertisement'}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-3xl  p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <Eye className="w-5 h-5 text-indigo-500 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Live Preview</h3>
            </div>

            {/* Ad Preview */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50">
              {formData.title || imagePreview || formData.description || formData.link ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Image Section */}
                  {imagePreview && (
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={imagePreview}
                        alt="Ad preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview(null)}
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="p-4">
                    {formData.title && (
                      <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                        {formData.title}
                      </h4>
                    )}
                    
                    {formData.slug && (
                      <div className="text-xs text-gray-400 font-mono mb-2">
                        /{formData.slug}
                      </div>
                    )}
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {formData.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {formData.description}
                      </p>
                    )}
                    
                    {formData.link && (
                      <div className="flex items-center text-indigo-500 text-sm">
                        <LinkIcon className="w-3 h-3 mr-1" />
                        <span className="truncate">{formData.link}</span>
                      </div>
                    )}

                    {formData.location && (
                      <div className="flex items-center text-gray-500 text-xs mt-2 pt-2 border-t border-gray-100">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>Will be shown: {locationOptions.find(opt => opt.value === formData.location)?.label}</span>
                      </div>
                    )}

                    {Array.isArray(formData.city) && formData.city.length > 0 && (
                      <div className="flex items-center text-gray-500 text-xs mt-2 pt-2 border-t border-gray-100">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>
                          Cities: {formData.city.map((c) => cityLocations.find(opt => opt.value === c)?.label || c).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Fill out the form to see your ad preview</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-indigo-800 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Use high-quality images (1200x630px recommended)</li>
                <li>• Keep titles under 60 characters for best visibility</li>
                <li>• Test your destination link before publishing</li>
                <li>• Add a clear call-to-action in your description</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}