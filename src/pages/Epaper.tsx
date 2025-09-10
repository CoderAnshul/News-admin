import React, { useState, ChangeEvent } from "react";
import { Upload, FileText, Plus, X, Save, Calendar, MapPin, Globe, Eye, Edit, Trash2, Download, Search, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface Page {
  pageNumber: number;
  image: string | null;
  uploaded: boolean;
}

interface EpaperType {
  id: number;
  title: string;
  date: string;
  city: string;
  country: string;
  language: string;
  totalPages: number;
  pages: Page[];
  status: string;
}

const initialEpapers: EpaperType[] = [
  {
    id: 1,
    title: "The Daily Herald",
    date: "2024-09-10",
    city: "Mumbai",
    country: "India",
    language: "English",
    totalPages: 12,
    pages: [
      { pageNumber: 1, image: null, uploaded: true },
      { pageNumber: 2, image: null, uploaded: true },
    ],
    status: "Published"
  }
];

const countries = ["India", "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan"];
const languages = ["English", "Hindi", "Spanish", "French", "German", "Japanese", "Chinese", "Arabic"];

export default function Epaper() {
  const [epapers, setEpapers] = useState<EpaperType[]>(initialEpapers);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [currentEpaper, setCurrentEpaper] = useState<EpaperType | null>(null);
  const [currentPageUpload, setCurrentPageUpload] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Image preview modal states
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [imageZoom, setImageZoom] = useState<number>(100);
  const [imageRotation, setImageRotation] = useState<number>(0);

  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    city: string;
    country: string;
    language: string;
    totalPages: number;
    pages: Page[];
  }>({
    title: "",
    date: new Date().toISOString().split('T')[0],
    city: "",
    country: "India",
    language: "English",
    totalPages: 1,
    pages: []
  });

  const [uploadedPages, setUploadedPages] = useState<Page[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'totalPages' ? Number(value) : value }));
    if (name === 'totalPages') {
      const pages = Array.from({ length: parseInt(value) || 1 }, (_, i) => ({
        pageNumber: i + 1,
        image: null,
        uploaded: false
      }));
      setFormData(prev => ({ ...prev, pages }));
      setUploadedPages([]);
      setCurrentPageUpload(1);
    }
  };

  const handlePageUpload = (e: ChangeEvent<HTMLInputElement>, pageNumber: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const imageData = ev.target?.result as string;
        setUploadedPages(prev => {
          const existing = prev.findIndex(p => p.pageNumber === pageNumber);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { pageNumber, image: imageData, uploaded: true };
            return updated;
          } else {
            return [...prev, { pageNumber, image: imageData, uploaded: true }];
          }
        });
        if (pageNumber < formData.totalPages) {
          setCurrentPageUpload(pageNumber + 1);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePageUpload = (pageNumber: number) => {
    setUploadedPages(prev => prev.filter(p => p.pageNumber !== pageNumber));
    if (currentPageUpload > pageNumber) {
      setCurrentPageUpload(pageNumber);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.city || uploadedPages.length === 0) return;
    const newEpaper: EpaperType = {
      id: currentEpaper ? currentEpaper.id : Date.now(),
      ...formData,
      pages: uploadedPages,
      status: "Published"
    };
    if (currentEpaper) {
      setEpapers(prev => prev.map(ep => ep.id === currentEpaper.id ? newEpaper : ep));
    } else {
      setEpapers(prev => [newEpaper, ...prev]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      date: new Date().toISOString().split('T')[0],
      city: "",
      country: "India",
      language: "English",
      totalPages: 1,
      pages: []
    });
    setUploadedPages([]);
    setCurrentPageUpload(1);
    setShowUploadForm(false);
    setCurrentEpaper(null);
  };

  const handleEdit = (epaper: EpaperType) => {
    setCurrentEpaper(epaper);
    setFormData(epaper);
    setUploadedPages(epaper.pages);
    setCurrentPageUpload(epaper.pages.length + 1);
    setShowUploadForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this e-paper?")) {
      setEpapers(prev => prev.filter(ep => ep.id !== id));
    }
  };

  const getUploadProgress = () => {
    return Math.round((uploadedPages.length / formData.totalPages) * 100);
  };

  // Image preview functions
  const openImageModal = (imageUrl: string, title: string) => {
    setPreviewImage(imageUrl);
    setPreviewTitle(title);
    setImageZoom(100);
    setImageRotation(0);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setPreviewImage(null);
    setPreviewTitle("");
    setImageZoom(100);
    setImageRotation(0);
  };

  const zoomIn = () => {
    setImageZoom(prev => Math.min(prev + 25, 300));
  };

  const zoomOut = () => {
    setImageZoom(prev => Math.max(prev - 25, 50));
  };

  const rotateImage = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };

  const resetImageView = () => {
    setImageZoom(100);
    setImageRotation(0);
  };

  const filteredEpapers = epapers.filter(epaper =>
    epaper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epaper.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epaper.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
              E-paper Management
            </h1>
            <p className="text-gray-600">Upload and manage newspaper editions with multiple pages</p>
          </div>
          
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload New E-paper
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, city, or country"
              className="w-full px-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Image Preview Modal */}
        {showImageModal && previewImage && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100010] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">{previewTitle}</h3>
                <div className="flex items-center space-x-2">
                  {/* Zoom Controls */}
                  <button
                    onClick={zoomOut}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">{imageZoom}%</span>
                  <button
                    onClick={zoomIn}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  
                  {/* Rotate Button */}
                  <button
                    onClick={rotateImage}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Rotate"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  
                  {/* Reset Button */}
                  <button
                    onClick={resetImageView}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                  
                  {/* Close Button */}
                  <button
                    onClick={closeImageModal}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body - Image Container */}
              <div className="p-4 h-[calc(95vh-80px)] overflow-auto flex items-center justify-center bg-gray-50">
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={previewImage}
                    alt={previewTitle}
                    className="max-w-full max-h-full object-contain shadow-lg transition-transform duration-200"
                    style={{
                      transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[100005] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentEpaper ? "Edit E-paper" : "Upload New E-paper"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Publication Details</h3>
                    
                    {/* Title */}
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Publication Name *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., The Daily Herald"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        Publication Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* City */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g., Mumbai"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Globe className="w-4 h-4 mr-2 text-blue-500" />
                          Country *
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                          required
                        >
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Language */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Globe className="w-4 h-4 mr-2 text-blue-500" />
                          Language
                        </label>
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        >
                          {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>

                      {/* Total Pages */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FileText className="w-4 h-4 mr-2 text-blue-500" />
                          Total Pages *
                        </label>
                        <input
                          type="number"
                          name="totalPages"
                          value={formData.totalPages}
                          onChange={handleInputChange}
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Progress */}
                    {formData.totalPages > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">Upload Progress</span>
                          <span className="text-sm text-gray-600">{uploadedPages.length}/{formData.totalPages} pages</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getUploadProgress()}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.title || !formData.city || uploadedPages.length === 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {currentEpaper ? "Update E-paper" : "Save E-paper"}
                    </button>
                  </div>

                  {/* Upload Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Upload Pages</h3>
                    
                    {/* Current Page Upload */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-4">
                        Upload Page {currentPageUpload} of {formData.totalPages}
                      </h4>
                      
                      <div className="relative mb-4">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handlePageUpload(e, currentPageUpload)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex items-center justify-center w-full py-8 px-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 cursor-pointer transition-colors bg-white hover:bg-blue-50">
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <p className="text-blue-700 font-medium">Drop page {currentPageUpload} here or click to browse</p>
                            <p className="text-blue-600 text-sm">Supports: JPG, PNG, PDF</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Page Navigation */}
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: formData.totalPages }, (_, i) => i + 1).map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPageUpload(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pageNum === currentPageUpload
                                ? "bg-blue-500 text-white"
                                : uploadedPages.some(p => p.pageNumber === pageNum)
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            Page {pageNum}
                            {uploadedPages.some(p => p.pageNumber === pageNum) && " ✓"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Uploaded Pages Preview */}
                    {uploadedPages.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Uploaded Pages</h4>
                        <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                          {uploadedPages
                            .sort((a, b) => a.pageNumber - b.pageNumber)
                            .map(page => (
                            <div key={page.pageNumber} className="relative bg-white rounded-lg shadow-md overflow-hidden">
                              <img
                                src={page.image}
                                alt={`Page ${page.pageNumber}`}
                                className="w-full h-24 object-cover cursor-pointer"
                                onClick={() => openImageModal(page.image!, `Page ${page.pageNumber}`)}
                              />
                              <div className="p-2 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">Page {page.pageNumber}</p>
                                <button
                                  onClick={() => openImageModal(page.image!, `Page ${page.pageNumber}`)}
                                  className="text-blue-500 hover:text-blue-700 transition-colors"
                                  title="View Full Size"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removePageUpload(page.pageNumber)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* E-papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEpapers.map(epaper => (
            <div key={epaper.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              {/* Preview */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative group">
                {epaper.pages && epaper.pages.length > 0 ? (
                  <>
                    <img
                      src={epaper.pages[0].image}
                      alt={`${epaper.title} preview`}
                      className="max-h-full max-w-full object-contain cursor-pointer"
                      onClick={() => openImageModal(epaper.pages[0].image!, `${epaper.title} - Page 1`)}
                    />
                    <button
                      onClick={() => openImageModal(epaper.pages[0].image!, `${epaper.title} - Page 1`)}
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                    >
                      <Eye className="w-8 h-8 text-white" />
                    </button>
                  </>
                ) : (
                  <FileText className="w-16 h-16 text-blue-400" />
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{epaper.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {epaper.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    {epaper.city}, {epaper.country}
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    {epaper.pages?.length || 0} pages • {epaper.language}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    epaper.status === "Published"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {epaper.status}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(epaper)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(epaper.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {epapers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No E-papers Yet</h3>
            <p className="text-gray-500 mb-6">Start by uploading your first newspaper edition</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Upload First E-paper
            </button>
          </div>
        )}

      </div>
    </div>
  );
}