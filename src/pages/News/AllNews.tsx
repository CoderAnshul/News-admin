import React, { useState, ChangeEvent } from "react";
import { Plus, Edit, Trash2, Search, Calendar, User, Tag, FileText, Upload, X, Save } from "lucide-react";

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
}

const initialNewsData: News[] = [
  { id: 1, title: "Tech Innovation in 2024", author: "John Doe", date: "2024-06-01", category: "Technology", status: "Published", excerpt: "Latest technological advancements shaping the future...", image: null },
  { id: 2, title: "Sports Championship Highlights", author: "Jane Smith", date: "2024-05-28", category: "Sports", status: "Published", excerpt: "Amazing moments from this year's championship games...", image: null },
  { id: 3, title: "Political Update: Elections", author: "Alex Lee", date: "2024-05-25", category: "Politics", status: "Draft", excerpt: "Comprehensive coverage of the upcoming elections...", image: null },
];

const categories = ["Technology", "Sports", "Politics", "Business", "Health", "Entertainment", "Science", "Travel"];

export default function AllNews() {
  const [newsData, setNewsData] = useState<News[]>(initialNewsData);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const [formData, setFormData] = useState<Omit<News, "id" | "date"> & { content: string }>({
    title: "",
    author: "",
    category: "",
    status: "Draft",
    excerpt: "",
    content: "",
    image: null
  });

  const [headingColor, setHeadingColor] = useState<string>("");
  const [headingRest, setHeadingRest] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.category) return;
    const newNews: News = {
      id: editingNews ? editingNews.id : Date.now(),
      ...formData,
      date: new Date().toISOString().split('T')[0]
    };
    if (editingNews) {
      setNewsData(prev => prev.map(news => news.id === editingNews.id ? newNews : news));
    } else {
      setNewsData(prev => [newNews, ...prev]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      status: "Draft",
      excerpt: "",
      content: "",
      image: null
    });
    setShowAddForm(false);
    setEditingNews(null);
    setHeadingColor("");
    setHeadingRest("");
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setFormData({ ...news, content: news.content || "" });
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      setNewsData(prev => prev.filter(news => news.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setNewsData(prev => prev.map(news => 
      news.id === id 
        ? { ...news, status: news.status === "Published" ? "Draft" : "Published" }
        : news
    ));
  };

  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || news.category === filterCategory;
    const matchesStatus = !filterStatus || news.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add News Article
          </button>
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar ">
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

                <div className="space-y-6 ">
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
                  {/* Preview Heading */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{headingColor}</span>
                      <span className="text-gray-900 dark:text-white"> {headingRest}</span>
                    </h3>
                  </div>
                  {/* Title */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Article Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter article title..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

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

                  {/* Status */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>

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

                  {/* Content */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Content
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write your article content here..."
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.title || !formData.author || !formData.category}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {editingNews ? "Update Article" : "Create Article"}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
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
                          <div className="font-semibold text-gray-900">{news.title}</div>
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
                      <button
                        onClick={() => toggleStatus(news.id)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          news.status === "Published"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {news.status}
                      </button>
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