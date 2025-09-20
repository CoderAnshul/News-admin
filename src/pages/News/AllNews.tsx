import React, { useState, ChangeEvent, useCallback } from "react";
import { Plus, Edit, Trash2, Search, Calendar, User, Tag, FileText, Upload, X, Save, Settings, Clock, TrendingUp, Hash } from "lucide-react";
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';


interface News {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string;
  status: string;
  excerpt: string;
  image: string | null;
  content?: string;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  isTrending?: boolean;
  tags?: string[];
  location?: string; // Add location field
  isTopNews?: boolean; // Add this field
  isLiveNews?: boolean; // Add this field
}

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  articles: number;
  color: string;
  parentId?: number;
  slug: string;
}

const initialNewsData: News[] = [
  { id: 1, title: "Tech Innovation in 2024", author: "John Doe", date: "2024-06-01", category: "Technology", status: "Published", excerpt: "Latest technological advancements shaping the future...", image: null, isTrending: true, tags: ["innovation", "future", "ai"] },
  { id: 2, title: "Sports Championship Highlights", author: "Jane Smith", date: "2024-05-28", category: "Sports", status: "Published", excerpt: "Amazing moments from this year's championship games...", image: null, isTrending: false, tags: ["sports", "championship", "highlights"] },
  { id: 3, title: "Political Update: Elections", author: "Alex Lee", date: "2024-05-25", category: "Politics", status: "Draft", excerpt: "Comprehensive coverage of the upcoming elections...", image: null, isTrending: true, tags: ["politics", "elections", "voting"] },
  { id: 4, title: "Future Tech Trends", author: "Sarah Wilson", date: "2024-06-10", category: "Technology", status: "Scheduled", excerpt: "What to expect in technology next year...", image: null, isScheduled: true, scheduledDate: "2024-12-25", scheduledTime: "09:00", isTrending: false, tags: ["technology", "trends", "future"] },
];

const initialCategories: Category[] = [
  { id: 1, name: "Technology", description: "Latest tech news and updates", createdAt: "2024-01-15", articles: 45, color: "#3B82F6", slug: "technology" },
  { id: 2, name: "Sports", description: "Sports news and events", createdAt: "2024-01-16", articles: 32, color: "#10B981", slug: "sports" },
  { id: 3, name: "Politics", description: "Political news and analysis", createdAt: "2024-01-17", articles: 28, color: "#F59E0B", slug: "politics" },
  { id: 4, name: "Business", description: "Business and finance news", createdAt: "2024-01-18", articles: 20, color: "#EF4444", slug: "business" },
  { id: 5, name: "Health", description: "Health and wellness news", createdAt: "2024-01-19", articles: 15, color: "#8B5CF6", slug: "health" },
  { id: 6, name: "Entertainment", description: "Entertainment industry news", createdAt: "2024-01-20", articles: 25, color: "#F97316", slug: "entertainment" },
];

const categories = ["Technology", "Sports", "Politics", "Business", "Health", "Entertainment", "Science", "Travel"];

// Predefined tags for suggestions
const predefinedTags = [
  "breaking", "urgent", "exclusive", "trending", "featured", "analysis", "opinion", 
  "interview", "review", "investigation", "update", "announcement", "innovation",
  "development", "research", "study", "report", "statistics", "data", "growth",
  "economy", "market", "finance", "business", "startup", "investment", "technology",
  "ai", "machine-learning", "blockchain", "crypto", "security", "privacy",
  "health", "medical", "covid", "vaccine", "treatment", "study", "research",
  "sports", "football", "basketball", "soccer", "olympics", "championship",
  "politics", "government", "policy", "law", "regulation", "election", "voting",
  "climate", "environment", "sustainability", "renewable", "energy", "green"
];

const locationOptions = [
  { value: "", label: "Select Location" },
  { value: "bikaner", label: "Bikaner" },
  { value: "jaipur", label: "Jaipur" },
  { value: "delhi", label: "Delhi" },
];

export default function AllNews() {
  const [newsData, setNewsData] = useState<News[]>(initialNewsData);
  const [categoriesData, setCategoriesData] = useState<Category[]>(initialCategories);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<Omit<News, "id" | "date"> & { content: string }>({
    title: "",
    author: "",
    category: "",
    status: "Draft",
    excerpt: "",
    content: "",
    image: null,
    isScheduled: false,
    scheduledDate: "",
    scheduledTime: "",
    isTrending: false,
    tags: [],
    location: "", // Add location to initial state
    isTopNews: false, // Add to initial state
    isLiveNews: false, // Add to initial state
  });

  const [categoryFormData, setCategoryFormData] = useState<{ name: string; description: string; color: string; parentId?: number; slug: string }>({
    name: "",
    description: "",
    color: "#3B82F6",
    parentId: undefined,
    slug: ""
  });

  const [tagInput, setTagInput] = useState<string>("");
  const [showTagSuggestions, setShowTagSuggestions] = useState<boolean>(false);

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

  const [headingColor, setHeadingColor] = useState<string>("");
  const [headingRest, setHeadingRest] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");

  // Category helper functions
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const getParentCategoryName = (parentId?: number): string => {
    if (!parentId) return "";
    const parent = categoriesData.find(cat => cat.id === parentId);
    return parent ? parent.name : "";
  };

  const getAvailableParentCategories = (): Category[] => {
    return categoriesData.filter(cat => 
      cat.id !== editingCategory?.id && 
      !cat.parentId
    );
  };

  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        ...(name === 'isScheduled' && !checked ? { scheduledDate: "", scheduledTime: "" } : {}),
        ...(name === 'isScheduled' && checked ? { status: "Scheduled" } : {})
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        setFormData(prev => ({ ...prev, image: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      status: "Draft",
      excerpt: "",
      content: "",
      image: null,
      isScheduled: false,
      scheduledDate: "",
      scheduledTime: "",
      isTrending: false,
      tags: [],
      location: "", // Reset location
      isTopNews: false, // Reset Top News
      isLiveNews: false, // Reset Live News
    });
    setTagInput("");
    setShowTagSuggestions(false);
    setShowAddForm(false);
    setEditingNews(null);
    setHeadingColor("");
    setHeadingRest("");
    setEditorContent("");
  };

  const handleEdit = useCallback((news: News) => {
    setEditingNews(news);
    
    // Split the title back into parts
    const titleParts = news.title.split(' ');
    const firstWord = titleParts[0] || '';
    const restWords = titleParts.slice(1).join(' ') || '';
    
    setHeadingColor(firstWord);
    setHeadingRest(restWords);
    
    setFormData({ 
      ...news, 
      content: news.content || "",
      isScheduled: news.isScheduled || false,
      scheduledDate: news.scheduledDate || "",
      scheduledTime: news.scheduledTime || "",
      isTrending: news.isTrending || false,
      tags: news.tags || [],
      location: news.location || "",
      isTopNews: news.isTopNews || false,
      isLiveNews: news.isLiveNews || false, // Add this line
    });
    setEditorContent(news.content || "");
    setShowAddForm(true);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Combine heading parts to create title
    const combinedTitle = (headingColor + " " + headingRest).trim();
    
    if (!combinedTitle || !formData.author || !formData.category) return;
    
    // Validate scheduling
    if (formData.isScheduled && (!formData.scheduledDate || !formData.scheduledTime)) {
      alert("Please set both scheduled date and time for scheduled posts.");
      return;
    }

    const newNews: News = {
      id: editingNews ? editingNews.id : Date.now(),
      ...formData,
      title: combinedTitle,
      content: editorContent,
      date: new Date().toISOString().split('T')[0],
      // Set status to Scheduled if scheduling is enabled
      status: formData.isScheduled ? "Scheduled" : formData.status,
      location: formData.location || "",
      isTopNews: formData.isTopNews || false,
      isLiveNews: formData.isLiveNews || false, // Add this line
    };
    
    if (editingNews) {
      setNewsData(prev => prev.map(news => news.id === editingNews.id ? newNews : news));
    } else {
      setNewsData(prev => [newNews, ...prev]);
    }
    resetForm();
  }, [headingColor, headingRest, formData, editorContent, editingNews]);

  const resetCategoryForm = () => {
    setCategoryFormData({ name: "", description: "", color: "#3B82F6", parentId: undefined, slug: "" });
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({ 
      name: category.name, 
      description: category.description, 
      color: category.color,
      parentId: category.parentId,
      slug: category.slug
    });
    setShowCategoryModal(true);
  };

  const handleCategoryDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      setCategoriesData(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      setNewsData(prev => prev.filter(news => news.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setNewsData(prev => prev.map(news => {
      if (news.id === id) {
        let newStatus;
        if (news.status === "Published") {
          newStatus = "Draft";
        } else if (news.status === "Draft") {
          newStatus = "Published";
        } else if (news.status === "Scheduled") {
          newStatus = "Published";
        } else {
          newStatus = "Published";
        }
        
        return { 
          ...news, 
          status: newStatus,
          // Clear scheduling if status is no longer Scheduled
          ...(newStatus !== "Scheduled" ? { isScheduled: false, scheduledDate: "", scheduledTime: "" } : {})
        };
      }
      return news;
    }));
  };

  // Category handlers - Add missing function
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    const slug = categoryFormData.slug.trim() || generateSlug(categoryFormData.name);

    if (editingCategory) {
      setCategoriesData(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryFormData.name, description: categoryFormData.description, color: categoryFormData.color, parentId: categoryFormData.parentId, slug }
          : cat
      ));
    } else {
      const newCategory: Category = {
        id: Date.now(),
        name: categoryFormData.name,
        description: categoryFormData.description,
        createdAt: new Date().toISOString().split('T')[0],
        articles: 0,
        color: categoryFormData.color,
        parentId: categoryFormData.parentId,
        slug
      };
      setCategoriesData(prev => [...prev, newCategory]);
    }

    resetCategoryForm();
  };

  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || news.category === filterCategory;
    const matchesStatus = !filterStatus || news.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get status badge styling
  const getStatusBadge = (news: News) => {
    const baseClasses = "inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors";
    
    switch (news.status) {
      case "Published":
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
      case "Draft":
        return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`;
      case "Scheduled":
        return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 hover:bg-gray-200`;
    }
  };

  // Get minimum date (today) for scheduling
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Tag management functions
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }));
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags?.length) {
      const lastTag = formData.tags[formData.tags.length - 1];
      removeTag(lastTag);
    }
  };

  const getFilteredTagSuggestions = () => {
    if (!tagInput) return [];
    return predefinedTags
      .filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !formData.tags?.includes(tag)
      )
      .slice(0, 6);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              News Management
            </h1>
            <p className="text-gray-600">Create, edit, and manage your news articles</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Manage Categories
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add News Article
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            
            <div className="text-sm text-gray-500 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              {filteredNews.length} articles found
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[1000005] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingNews ? "Edit News Article" : "Add New Article"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Heading Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        Colored Heading (first words)
                      </label>
                      <input
                        type="text"
                        value={headingColor}
                        onChange={e => setHeadingColor(e.target.value)}
                        placeholder="Enter colored heading..."
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        Rest of Heading
                      </label>
                      <input
                        type="text"
                        value={headingRest}
                        onChange={e => setHeadingRest(e.target.value)}
                        placeholder="Enter rest of heading..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Content Label */}
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    Content *
                  </label>

                  {/* Preview Heading */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{headingColor}</span>
                      <span className="text-gray-900 dark:text-white"> {headingRest}</span>
                    </h3>
                  </div>

                  {/* SimpleMDE Editor */}
                  <SimpleMDE 
                    value={editorContent} 
                    onChange={setEditorContent} 
                    options={{ 
                      spellChecker: false, 
                      placeholder: 'Write your news content here...',
                      toolbar: [
                        "bold", "italic", "heading", "|",
                        "quote", "unordered-list", "ordered-list", "|", 
                        "link", "image", "|",
                        "preview", "side-by-side", "fullscreen", "|",
                        "guide"
                      ],
                      status: false,
                      hideIcons: ["guide"]
                    }} 
                    className="mb-6" 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Author */}
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        Author *
                      </label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Author name..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Tag className="w-4 h-4 mr-2 text-blue-500" />
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Select category...</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 mr-2 text-blue-500" />
                      Location
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      {locationOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags Section */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Hash className="w-4 h-4 mr-2 text-blue-500" />
                      Tags
                    </label>
                    
                    {/* Selected Tags Display */}
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Type tags and press Enter or comma to add..."
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
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Press Enter or comma to add tags. Use hashtags for better categorization.
                    </p>
                  </div>

                  {/* Status, Scheduling, and Trending */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={formData.isScheduled}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Schedule Publication
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isScheduled"
                          checked={formData.isScheduled}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Schedule for later</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                        Trending Topic
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isTrending"
                          checked={formData.isTrending}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Mark as trending</span>
                      </div>
                    </div>

                    {/* Top News Toggle */}
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <TrendingUp className="w-4 h-4 mr-2 text-red-500" />
                        Add to Top News
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isTopNews"
                          checked={formData.isTopNews}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Show this article in the Top News section</span>
                      </div>
                    </div>

                    {/* Live News Toggle */}
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                        Show as Live News
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isLiveNews"
                          checked={formData.isLiveNews}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Show this article in the Live News section</span>
                      </div>
                    </div>
                  </div>

                  {/* Trending Notice */}
                  {formData.isTrending && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                        <div>
                          <h4 className="text-sm font-semibold text-orange-800">Trending Topic</h4>
                          <p className="text-sm text-orange-700">This article will be featured in the trending topics section.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scheduling Fields */}
                  {formData.isScheduled && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Schedule Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Publish Date *
                          </label>
                          <input
                            type="date"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={handleInputChange}
                            min={getMinDate()}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={formData.isScheduled}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Publish Time *
                          </label>
                          <input
                            type="time"
                            name="scheduledTime"
                            value={formData.scheduledTime}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={formData.isScheduled}
                          />
                        </div>
                      </div>
                      {formData.scheduledDate && formData.scheduledTime && (
                        <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Scheduled for:</strong> {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Upload */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="w-4 h-4 mr-2 text-blue-500" />
                      Featured Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center justify-center w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50">
                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">Click to upload image</span>
                      </div>
                    </div>
                    {formData.image && (
                      <div className="mt-2">
                        <img src={formData.image} alt="Preview" className="w-32 h-20 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Excerpt
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Brief description of the article..."
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmit}
                      disabled={!(headingColor.trim() || headingRest.trim()) || !editorContent || !formData.author || !formData.category || (formData.isScheduled && (!formData.scheduledDate || !formData.scheduledTime))}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {editingNews ? "Update Article" : formData.isScheduled ? "Schedule Article" : "Create Article"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[1000006] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
                  <button
                    onClick={resetCategoryForm}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Add Category Form */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h3>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={categoryFormData.name}
                          onChange={(e) => handleCategoryNameChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter category name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent Category
                        </label>
                        <select
                          value={categoryFormData.parentId || ""}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, parentId: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">No Parent (Main Category)</option>
                          {getAvailableParentCategories().map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug *
                        </label>
                        <input
                          type="text"
                          value={categoryFormData.slug}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="category-slug"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={categoryFormData.color}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <div className="grid grid-cols-5 gap-1 flex-1">
                            {colorOptions.slice(0, 5).map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setCategoryFormData({ ...categoryFormData, color: color.value })}
                                className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                                  categoryFormData.color.toUpperCase() === color.value.toUpperCase()
                                    ? 'border-gray-800' 
                                    : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter category description"
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {editingCategory ? "Update" : "Add"} Category
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          onClick={resetCategoryForm}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Slug
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Articles
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {categoriesData.map((category) => (
                          <tr key={category.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-3" 
                                  style={{ backgroundColor: category.color }}
                                ></div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                  <div className="text-sm text-gray-500">{category.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {category.parentId ? getParentCategoryName(category.parentId) : "Main Category"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                              {category.slug}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {category.articles}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleCategoryEdit(category)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCategoryDelete(category.id)}
                                  className="text-red-600 hover:text-red-800"
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
              </div>
            </div>
          </div>
        )}

        {/* News Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trending</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredNews.map(news => (
                  <tr key={news.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {news.image && (
                          <img src={news.image} alt="" className="w-12 h-12 rounded-lg object-cover mr-4" />
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center">
                            {news.title}
                            {news.isTrending && (
                              <span title="Trending">
                                <TrendingUp className="w-4 h-4 text-orange-500 ml-2" />
                              </span>
                            )}
                          </div>
                          {news.excerpt && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{news.excerpt}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{news.author}</td>
                    <td className="px-6 py-4 text-gray-700">{news.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {news.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {news.tags && news.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {news.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                            >
                              #{tag}
                            </span>
                          ))}
                          {news.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{news.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No tags</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(news.id)}
                        className={getStatusBadge(news)}
                      >
                        {news.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {news.isTrending ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {news.isScheduled && news.scheduledDate && news.scheduledTime ? (
                        <div className="text-sm">
                          <div className="font-medium text-blue-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Scheduled
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(`${news.scheduledDate}T${news.scheduledTime}`).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(`${news.scheduledDate}T${news.scheduledTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(news)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(news.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
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

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No articles found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}