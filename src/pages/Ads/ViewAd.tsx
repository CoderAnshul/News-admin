import { ArrowLeft, Calendar, MapPin, Hash, ExternalLink, Edit, Trash2, Eye, Share, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

interface Advertisement {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  description: string;
  location: string;
  slug: string;
  tags: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

// Mock data - in real app, this would come from props or API
const mockAdvertisements: Advertisement[] = [
  {
    id: 1,
    title: "Premium Technology Solutions",
    imageUrl: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Premium+Tech+Ad",
    link: "https://example.com/tech-solutions",
    description: "Discover cutting-edge technology solutions that transform your business. Our comprehensive suite of digital tools helps streamline operations and boost productivity.",
    location: "home-banner",
    slug: "premium-technology-solutions",
    tags: ["technology", "business", "digital", "solutions"],
    createdAt: "2024-01-15T10:30:00.000Z",
    status: "active"
  },
  {
    id: 2,
    title: "Summer Sale Campaign",
    imageUrl: "https://via.placeholder.com/800x400/10B981/FFFFFF?text=Summer+Sale+50%25+OFF",
    link: "https://example.com/summer-sale",
    description: "Don't miss our biggest summer sale! Get up to 50% off on all products. Limited time offer with exclusive deals on top brands.",
    location: "sidebar",
    slug: "summer-sale-campaign",
    tags: ["sale", "discount", "promotion", "summer"],
    createdAt: "2024-01-14T14:20:00.000Z",
    status: "active"
  }
];

const locationLabels = {
  "home-banner": "Homepage Top Banner",
  "between-paragraph": "Article Inline (Between Paragraphs)",
  "sidebar": "Sidebar Advertisement",
  "footer": "Footer Banner",
  "popup": "Popup Advertisement"
};

export default function ViewAd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API call
    const fetchAdvertisement = async () => {
      setLoading(true);
      // In real app, fetch from API using the id
      const ad = mockAdvertisements.find(ad => ad.id === Number(id));
      setAdvertisement(ad || null);
      setLoading(false);
    };

    fetchAdvertisement();
  }, [id]);

  const handleEdit = () => {
    navigate(`/ads/edit/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      // Delete logic here
      navigate("/ads/manage");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: advertisement?.title,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (advertisement?.imageUrl) {
      const link = document.createElement('a');
      link.href = advertisement.imageUrl;
      link.download = `${advertisement.slug}.jpg`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading advertisement...</p>
        </div>
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Advertisement Not Found</h2>
          <p className="text-gray-600 mb-6">The advertisement you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/ads/manage")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Advertisements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/ads/manage")}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors shadow-sm"
              title="Back to manage ads"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{advertisement.title}</h1>
              <p className="text-gray-600 mt-1">Advertisement Details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors shadow-sm"
              title="Share"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors shadow-sm"
              title="Download Image"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Advertisement Preview</h2>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    advertisement.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {advertisement.status}
                  </span>
                </div>
              </div>

              {/* Ad Preview Container */}
              <div className="p-8 bg-gray-50">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 max-w-2xl mx-auto">
                  {/* Image Section */}
                  {advertisement.imageUrl && (
                    <div className="relative">
                      <img
                        src={advertisement.imageUrl}
                        alt={advertisement.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">
                      {advertisement.title}
                    </h3>
                    
                    <div className="text-xs text-gray-400 font-mono mb-3">
                      /{advertisement.slug}
                    </div>
                    
                    {advertisement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {advertisement.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {advertisement.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {advertisement.description}
                      </p>
                    )}
                    
                    <a
                      href={advertisement.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-gray-800">
                      {new Date(advertisement.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Placement</p>
                    <p className="text-gray-800">
                      {locationLabels[advertisement.location as keyof typeof locationLabels]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ExternalLink className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Destination</p>
                    <a 
                      href={advertisement.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                    >
                      {advertisement.link}
                    </a>
                  </div>
                </div>

                {advertisement.tags.length > 0 && (
                  <div className="flex items-start">
                    <Hash className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tags</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {advertisement.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats (Mock) */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Impressions</span>
                  <span className="font-semibold text-gray-800">12,543</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clicks</span>
                  <span className="font-semibold text-gray-800">847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CTR</span>
                  <span className="font-semibold text-green-600">6.75%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversions</span>
                  <span className="font-semibold text-blue-600">23</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Advertisement
                </button>
                
                <button
                  onClick={() => {
                    // Toggle status logic
                    const newStatus = advertisement.status === 'active' ? 'inactive' : 'active';
                    setAdvertisement(prev => prev ? { ...prev, status: newStatus } : null);
                  }}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    advertisement.status === 'active'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {advertisement.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Advertisement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
