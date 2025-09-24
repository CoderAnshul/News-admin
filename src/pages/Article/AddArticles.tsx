import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createArticle } from '../../../store/slices/articles';
import { fetchCategories } from '../../../store/slices/category';
import { RootState } from '../../../store';
import { 
  Save, 
  Upload, 
  FileText, 
  User, 
  Tag, 
  Image, 
  Eye, 
  Calendar,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const AddArticles = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.article);
  const { categories } = useSelector((state: RootState) => state.category);
  
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories() as any);
  }, [dispatch]);

  const [form, setForm] = useState({
    coloredHeading: '',
    restHeading: '',
    articleTitle: '',
    category: '',
    status: 'draft',
    excerpt: '',
    content: '',
    author: '',
    featuredImage: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, featuredImage: file }));
    
    // Create image preview
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'featuredImage' && value) {
        formData.append(key, value);
      } else if (key !== 'featuredImage') {
        formData.append(key, value as string);
      }
    });
    
    try {
      await dispatch(createArticle(formData) as any);
      setShowSuccess(true);
      // Reset form
      setForm({
        coloredHeading: '',
        restHeading: '',
        articleTitle: '',
        category: '',
        status: 'draft',
        excerpt: '',
        content: '',
        author: '',
        featuredImage: null,
      });
      setImagePreview(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating article:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className=" mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Create New Article
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Share your story with the world
              </p>
            </div>
          </div>
          
         
        </div>

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Article Headers Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Article Headers</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Colored Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="coloredHeading"
                    placeholder="Enter the highlighted part of the heading"
                    value={form.coloredHeading}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Rest Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="restHeading"
                    placeholder="Enter the remaining part of the heading"
                    value={form.restHeading}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Article Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="articleTitle"
                  placeholder="Enter the main title of your article"
                  value={form.articleTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  required
                />
              </div>
            </div>

            {/* Article Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Article Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="author"
                      placeholder="Author name"
                      value={form.author}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors appearance-none"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors appearance-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Article Content</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Article Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="excerpt"
                  placeholder="Write a brief summary of your article (1-2 sentences)"
                  value={form.excerpt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {form.excerpt.length}/200 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Article Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  placeholder="Write your full article content here..."
                  value={form.content}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                  rows={8}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {form.content.length} characters
                </p>
              </div>
            </div>

            {/* Featured Image Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <Image className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Image</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload Featured Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto max-h-48 rounded-lg shadow-lg"
                      />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {form.featuredImage?.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, featuredImage: null }));
                            setImagePreview(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto w-12 h-12 text-gray-400" />
                      <div>
                        <label htmlFor="featuredImage" className="cursor-pointer">
                          <span className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">
                            Click to upload
                          </span>
                          <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                        </label>
                        <input
                          id="featuredImage"
                          type="file"
                          name="featuredImage"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Article...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-6 h-6 mr-3" />
                    Create Article
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-in slide-in-from-right-5 duration-300">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Success!</p>
                <p className="text-sm opacity-90">Article created successfully</p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-2 hover:bg-green-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-in slide-in-from-right-5 duration-300">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Creating Article</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Please wait while we process your article...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddArticles;