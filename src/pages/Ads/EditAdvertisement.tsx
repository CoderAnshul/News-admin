import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdvertisementById, updateAdvertisement } from "../../../store/slices/advertisement";
import { Save, X, Upload, Link as LinkIcon, MapPin, Hash, Eye, ArrowLeft } from "lucide-react";

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

export default function EditAdvertisement() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentAd, loading } = useSelector((state: any) => state.advertisement);

  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    tags: [],
    description: "",
    destinationLink: "",
    placementLocation: "",
    cities: [],
    amountPaid: "",
    viewsAllowed: "",
    category: "",
    media: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchAdvertisementById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentAd && currentAd._id === id) {
      setFormData({
        title: currentAd.title || "",
        slug: currentAd.slug || "",
        tags: currentAd.tags || [],
        description: currentAd.description || "",
        destinationLink: currentAd.destinationLink || "",
        placementLocation: currentAd.placementLocation || "",
        cities: currentAd.cities || [],
        amountPaid: currentAd.amountPaid ?? "",
        viewsAllowed: currentAd.viewsAllowed ?? "",
        category: typeof currentAd.category === "object" ? currentAd.category.name : currentAd.category || "",
        media: currentAd.media || "",
      });
      setImagePreview(currentAd.media ? `${import.meta.env.VITE_IMAGE_URL || "http://localhost:4000/uploads"}/${currentAd.media}` : null);
    }
  }, [currentAd, id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === "cities") {
      const options = (e.target as HTMLSelectElement).options;
      const selected: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) selected.push(options[i].value);
      }
      setFormData((prev: any) => ({ ...prev, cities: selected }));
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({ ...prev, media: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: checked
        ? [...(prev.tags || []), tag]
        : (prev.tags || []).filter((t: string) => t !== tag),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData();
    form.append("title", formData.title);
    form.append("slug", formData.slug);
    form.append("description", formData.description);
    form.append("destinationLink", formData.destinationLink);
    form.append("placementLocation", formData.placementLocation);
    form.append("amountPaid", formData.amountPaid);
    form.append("viewsAllowed", formData.viewsAllowed);
    form.append("category", formData.category);
    (formData.tags || []).forEach((tag: string) => form.append("tags[]", tag));
    (formData.cities || []).forEach((city: string) => form.append("cities[]", city));
    if (formData.media && typeof formData.media !== "string") {
      form.append("media", formData.media);
    }
    await dispatch(updateAdvertisement({ id, formData: form }) as any);
    setIsSubmitting(false);
    navigate("/advertisement");
  };

  if (loading && !currentAd) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={() => navigate("/advertisement")}
          className="mb-6 flex items-center text-gray-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Advertisements
        </button>
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold mb-6">Edit Advertisement</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                required
              />
            </div>
            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold mb-2">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {["banner", "popup", "sidebar", "sponsored", "promotion"].map((tag) => (
                  <label key={tag} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={formData.tags?.includes(tag)}
                      onChange={e => handleTagChange(tag, e.target.checked)}
                    />
                    <span className="text-xs">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                rows={3}
              />
            </div>
            {/* Media */}
            <div>
              <label className="block text-sm font-semibold mb-2">Media</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded" />
                </div>
              )}
            </div>
            {/* Destination Link */}
            <div>
              <label className="block text-sm font-semibold mb-2">Destination Link</label>
              <input
                type="url"
                name="destinationLink"
                value={formData.destinationLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
            {/* Placement Location */}
            <div>
              <label className="block text-sm font-semibold mb-2">Placement Location</label>
              <select
                name="placementLocation"
                value={formData.placementLocation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              >
                {locationOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {/* Cities */}
            <div>
              <label className="block text-sm font-semibold mb-2">Cities</label>
              <select
                name="cities"
                multiple
                value={formData.cities}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                style={{ minHeight: "3.5rem" }}
              >
                {cityLocations.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {/* Amount Paid */}
            <div>
              <label className="block text-sm font-semibold mb-2">Amount Paid (₹)</label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
            {/* Views Allowed */}
            <div>
              <label className="block text-sm font-semibold mb-2">Views Allowed</label>
              <input
                type="number"
                name="viewsAllowed"
                value={formData.viewsAllowed}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              >
                <option value="">Select Category</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating Advertisement...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Update Advertisement
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
