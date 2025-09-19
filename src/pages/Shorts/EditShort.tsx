import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Plus, X, Link as LinkIcon, Play, Pause, Eye, Upload, Save, Hash } from 'lucide-react';

interface ShortLink {
  url: string;
  title: string;
}

interface Short {
  id: number;
  title: string;
  media: string;
  text: string;
  category: string;
  views: number;
  type: string;
  thumbnail: string;
  links: ShortLink[];
  slug?: string;
  tags?: string[];
}

const shortsData: Short[] = [
  { 
    id: 1, 
    title: "Amazing Mountain Adventure", 
    media: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", 
    text: "Exploring the beautiful mountains and their scenic views. This is a longer description to show how it displays in the edit form.", 
    category: "Sports", 
    views: 1200,
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    slug: "amazing-mountain-adventure",
    tags: ["adventure", "mountain", "travel", "nature"],
    links: [
      { url: "https://example.com/mountain-guide", title: "Mountain Guide" },
      { url: "https://example.com/hiking-tips", title: "Hiking Tips" }
    ]
  },
  { 
    id: 2, 
    title: "Political Discussion", 
    media: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca", 
    text: "Latest political developments and their impact on society", 
    category: "Politics", 
    views: 950,
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    links: [
      { url: "https://example.com/politics", title: "Political News" }
    ]
  },
];

export default function EditShort() {
  // Always use the first short for demo purposes
  const short = shortsData[0];

  const [links, setLinks] = useState<ShortLink[]>(short?.links || [{ url: '', title: '' }]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(short?.media || null);
  const [mediaType, setMediaType] = useState<string | null>(short?.type || null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(short?.thumbnail || null);
  const [autoThumbnailPreview, setAutoThumbnailPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [form, setForm] = useState<{ 
    title: string; 
    text: string; 
    category: string; 
    slug: string;
  }>({
    title: short?.title || "",
    text: short?.text || "",
    category: short?.category || "",
    slug: short?.slug || "",
  });

  // Tags state
  const [tags, setTags] = useState<string[]>(short?.tags || []);
  const [tagInput, setTagInput] = useState<string>("");
  const [showTagSuggestions, setShowTagSuggestions] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  // Predefined tags for suggestions
  const predefinedTags = [
    "viral", "trending", "breaking", "news", "entertainment", "sports", 
    "politics", "business", "technology", "lifestyle", "health", "travel",
    "food", "music", "comedy", "education", "science", "nature", "art", 
    "fashion", "gaming", "fitness", "motivation", "tips", "review", "tutorial"
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
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      const lastTag = tags[tags.length - 1];
      removeTag(lastTag);
    }
  };

  const getFilteredTagSuggestions = () => {
    if (!tagInput) return [];
    return predefinedTags
      .filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(tag)
      )
      .slice(0, 6);
  };

  const addLink = () => {
    setLinks([...links, { url: '', title: '' }]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateLink = (index: number, field: keyof ShortLink, value: string) => {
    const updatedLinks = links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setLinks(updatedLinks);
  };

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous media preview
      if (mediaPreview && mediaFile) {
        URL.revokeObjectURL(mediaPreview);
      }
      
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      const newMediaType = file.type.startsWith('video/') ? 'video' : 'image';
      setMediaType(newMediaType);
      
      // Auto-generate thumbnail for videos
      if (newMediaType === 'video') {
        generateThumbnail(url);
      } else {
        // Clear auto thumbnail for images
        setAutoThumbnailPreview(null);
      }
    }
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous thumbnail preview
      if (thumbnailPreview && thumbnailFile) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const generateThumbnail = (videoUrl: string) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = 1; // Capture frame at 1 second
    };
    
    video.onseeked = () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        setAutoThumbnailPreview(thumbnailUrl);
      }
    };
    
    video.src = videoUrl;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value,
      // Auto-generate slug when title changes
      ...(name === 'title' ? { slug: prev.slug || generateSlug(value) } : {})
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Handle form submission here
    const formData = {
      ...form,
      tags,
      mediaFile: mediaFile || short.media,
      thumbnailFile: thumbnailFile || thumbnailPreview,
      links: links.filter(link => link.url.trim() !== ''),
    };
    console.log('Short updated:', formData);
    alert("Short updated successfully!");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Short</h2>
                  <p className="text-blue-100 mt-1">Update your content</p>
                </div>
              </div>
              <div className="text-blue-100">
                ID: {short.id}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Title <span className="text-blue-600">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={form.title}
                onChange={handleChange}
                required 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="Enter an engaging title..."
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-mono text-sm"
                placeholder="short-slug"
              />
              <p className="text-xs text-gray-500">
                URL-friendly version of the title. Auto-generated if left empty.
              </p>
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                <Hash className="inline w-4 h-4 mr-2" />
                Tags
              </label>
              
              {/* Selected Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
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
              
              <p className="text-xs text-gray-500">
                Press Enter or comma to add tags. Use hashtags for better discoverability.
              </p>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Media Content</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Main Media Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Video/Image
                  </label>
                  
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                            {mediaFile ? 'Replace Media' : 'Change Media'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Images (JPG, PNG) or Videos (MP4, MOV)
                          </p>
                        </div>
                      </div>
                    </button>
                    
                    <input 
                      ref={mediaInputRef}
                      type="file" 
                      name="media" 
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                  </div>

                  {/* Media Preview */}
                  {mediaPreview && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Current Media
                      </h4>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        {mediaType === 'video' ? (
                          <div className="relative bg-black rounded-lg overflow-hidden">
                            <video
                              ref={videoRef}
                              src={mediaPreview}
                              className="w-full h-48 object-cover"
                              onPlay={() => setIsPlaying(true)}
                              onPause={() => setIsPlaying(false)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={togglePlay}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-all transform hover:scale-110 shadow-lg"
                              >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Thumbnail Image
                  </label>
                  
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-blue-200 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group bg-blue-25"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <Upload className="w-8 h-8 text-blue-400 group-hover:text-blue-500" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-blue-700 group-hover:text-blue-600">
                            {thumbnailFile ? 'Replace Thumbnail' : 'Change Thumbnail'}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Custom thumbnail image (Optional)
                          </p>
                        </div>
                      </div>
                    </button>
                    
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="space-y-3">
                    {/* Custom Thumbnail Preview */}
                    {thumbnailPreview && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-2">
                          {thumbnailFile ? 'New Thumbnail:' : 'Current Thumbnail:'}
                        </h5>
                        <div className="relative inline-block w-full">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-60 rounded-full p-2">
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auto Thumbnail Preview */}
                    {autoThumbnailPreview && !thumbnailPreview && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-2">Auto-generated Thumbnail:</h5>
                        <div className="relative inline-block w-full">
                          <img
                            src={autoThumbnailPreview}
                            alt="Auto thumbnail"
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-60 rounded-full p-2">
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No thumbnail available */}
                    {!thumbnailPreview && !autoThumbnailPreview && (
                      <div className="text-center py-8 text-gray-400">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Upload media to see thumbnail options</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description <span className="text-blue-600">*</span>
              </label>
              <textarea 
                name="text" 
                value={form.text}
                onChange={handleChange}
                required 
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                placeholder="Write a compelling description for your short..."
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Category <span className="text-blue-600">*</span>
              </label>
              <select 
                name="category" 
                value={form.category}
                onChange={handleChange}
                required 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
              >
                <option value="">Choose a category</option>
                <option value="Sports">🏈 Sports</option>
                <option value="Politics">🏛️ Politics</option>
                <option value="Business">💼 Business</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Technology">💻 Technology</option>
                <option value="Lifestyle">🌟 Lifestyle</option>
              </select>
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  <LinkIcon className="inline w-4 h-4 mr-2" />
                  Related Links
                </label>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Link
                </button>
              </div>
              
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all outline-none text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Link title (optional)"
                        value={link.title}
                        onChange={(e) => updateLink(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all outline-none text-sm"
                      />
                    </div>
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="mt-1 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Update Short
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Changes will be saved and reflected immediately
        </p>
      </div>
    </div>
  );
}