import React, { useState, ChangeEvent, FormEvent } from "react";
import { Upload, Link as LinkIcon, Type, Eye, Save, ImageIcon, X } from "lucide-react";

interface AdFormData {
  title: string;
  imageUrl: string;
  link: string;
  description: string;
}

export default function AddAds() {
  const [formData, setFormData] = useState<AdFormData>({
    title: "",
    imageUrl: "",
    link: "",
    description: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    console.log("Ad created:", formData);
    alert("Advertisement created successfully!");
    
    // Reset form
    setFormData({ title: "", imageUrl: "", link: "", description: "" });
    setImagePreview(null);
    setIsSubmitting(false);
  };

  const clearImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-full mx-auto">

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

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.link}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Advertisement...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    Create Advertisement
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