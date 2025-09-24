import { useState, useEffect, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/slices/store";
import { fetchArticles, deleteArticle } from "../../../store/slices/articles";
import { Plus, Edit3, Trash2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Article {
  _id: string;
  coloredHeading?: string;
  restHeading?: string;
  articleTitle?: string;
  author?: string;
  category?: { _id: string; name: string } | string | null; // updated type
  status?: "draft" | "published";
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Articles() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // Add a fallback to avoid destructuring undefined
  const articleState = useSelector((state: RootState) => state.article) || {};
  const {
    articles: articlesRaw = [],
    loading = false,
    error = null,
    pagination = { total: 0, page: 1, pages: 1, limit: 10 }
  } = articleState;
  const articles: Article[] = Array.isArray(articlesRaw) ? articlesRaw : [];
  const [page, setPage] = useState<number>(1);
  const limit = pagination.limit || 10;
  const pages = pagination.pages || 1;
  const total = pagination.total || articles.length;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  useEffect(() => {
    dispatch(fetchArticles({ page, limit }));
  }, [dispatch, page, limit]);

  const filteredArticles = articles.filter(article =>
    (article.coloredHeading || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.restHeading || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.articleTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.author || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.excerpt || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (articleToDelete) {
      await dispatch(deleteArticle(articleToDelete._id) as any);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
      // Refresh the list after delete
      dispatch(fetchArticles({ page, limit }) as any);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setArticleToDelete(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Articles
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and organize your news articles
            </p>
          </div>
          <button
            onClick={() => navigate("/articles/add")}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Article
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {articles.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Articles
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {articles.filter(a => a.status === "published").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Published
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {articles.filter(a => a.status === "draft").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Drafts
            </div>
          </div>
        </div>

        {/* Search and Total */}
        <div className="mb-6 flex items-center justify-between mt-10">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="bg-transparent p-2 w-32 text-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Total : <span className="text-lg font-semibold text-gray-900 dark:text-white">{total}</span>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No.</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Colored Heading</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rest Heading</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? "No articles found matching your search." : "No articles created yet."}
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article, idx) => (
                    <tr key={article._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {(page - 1) * limit + idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-blue-700 dark:text-blue-400 font-semibold">
                          {article.coloredHeading}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {article.restHeading}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {article.articleTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {article.author}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {typeof article.category === "object" && article.category !== null
                            ? article.category.name
                            : typeof article.category === "string"
                              ? article.category
                              : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          article.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {article.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ""}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/articles/edit/${article._id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit article"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(article)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete article"
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

        {/* Pagination Controls */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex rounded-lg px-2 py-1 space-x-2">
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
      {deleteModalOpen && articleToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100010]">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-lg p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Delete Article
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{articleToDelete.articleTitle}</span>? This action cannot be undone.
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
    </div>
  );
}
