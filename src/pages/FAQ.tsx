import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, X, HelpCircle } from 'lucide-react';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

interface ModalData {
    id?: number;
    question: string;
    answer: string;
    isEditing: boolean;
}

export default function FAQ() {
    const [faqs, setFaqs] = useState<FaqItem[]>([
        {
            id: 1,
            question: "What is LOGO?",
            answer: "LOGO is a modern admin dashboard template for managing your content efficiently. It provides a comprehensive set of tools and components to help you build powerful web applications with ease."
        },
        {
            id: 2,
            question: "How do I add a new article?",
            answer: "Go to the News Management section and click on 'Add News Article' to create a new article. You can add images, format text, and schedule publication dates."
        },
        {
            id: 3,
            question: "Can I customize the dashboard?",
            answer: "Yes, you can customize the dashboard by editing the components and styles as needed. The template is built with modern frameworks and is fully customizable to match your brand."
        }
    ]);

    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([1]));
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const openCreateModal = () => {
        setModalData({ question: '', answer: '', isEditing: false });
        setIsModalOpen(true);
    };

    const openEditModal = (faq: FaqItem) => {
        setModalData({ ...faq, isEditing: true });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setModalData(null);
        setIsModalOpen(false);
    };

    const handleSave = () => {
        if (modalData && modalData.question.trim() && modalData.answer.trim()) {
            if (modalData.isEditing && modalData.id !== undefined) {
                setFaqs(faqs.map(faq => 
                    faq.id === modalData.id 
                        ? { id: modalData.id!, question: modalData.question.trim(), answer: modalData.answer.trim() } 
                        : faq
                ));
            } else {
                const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;
                const newFaq: FaqItem = {
                    id: newId,
                    question: modalData.question.trim(),
                    answer: modalData.answer.trim()
                };
                setFaqs([...faqs, newFaq]);
                setExpandedItems(new Set([newId]));
            }
            closeModal();
        }
    };

    const deleteFaq = (id: number) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            setFaqs(faqs.filter(faq => faq.id !== id));
            const newExpanded = new Set(expandedItems);
            newExpanded.delete(id);
            setExpandedItems(newExpanded);
        }
    };

    return (
        <>
            <div className="min-h-screen">
                <div className="max-w-fullxl mx-auto">

                    {/* Enhanced Add Button */}
                    <div className="mb-2 text-center flex w-full justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
                            Frequently Asked Questions
                        </h1>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                        >
                            <Plus className="w-6 h-6 mr-3" />
                            Create New FAQ
                        </button>
                    </div>

                    {/* Enhanced FAQ Items */}
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div
                                key={faq.id}
                                className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                {/* FAQ Header */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2 flex-1">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-xs">{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <button
                                                    onClick={() => toggleExpand(faq.id)}
                                                    className="w-full text-left group"
                                                >
                                                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                                                        {faq.question}
                                                    </h2>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Enhanced Action Buttons */}
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => openEditModal(faq)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200 hover:scale-110 transform"
                                                title="Edit FAQ"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteFaq(faq.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 hover:scale-110 transform"
                                                title="Delete FAQ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleExpand(faq.id)}
                                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-110 transform"
                                                title={expandedItems.has(faq.id) ? "Collapse" : "Expand"}
                                            >
                                                {expandedItems.has(faq.id) ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Animated FAQ Answer */}
                                <div
                                    className={`transition-all duration-500 ease-in-out ${
                                        expandedItems.has(faq.id)
                                            ? 'max-h-[500px] opacity-100 scale-100'
                                            : 'max-h-0 opacity-0 scale-95 pointer-events-none'
                                    } overflow-hidden`}
                                >
                                    <div className="px-6 pb-3">
                                        <div className="border-t border-gray-100">
                                            <div className="bg-blue-50 rounded-xl p-4">
                                                <p className="text-gray-700 leading-relaxed text-base">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Empty State */}
                    {faqs.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                                <HelpCircle className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No FAQs Yet</h3>
                            <p className="text-gray-600 mb-8 text-base">Create your first FAQ to get started helping your users.</p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus className="w-6 h-6 mr-3" />
                                Create Your First FAQ
                            </button>
                        </div>
                    )}

                    {/* Enhanced Stats Footer */}
                    <div className="mt-16 text-center">
                        <div className="inline-flex items-center px-8 py-4 bg-white rounded-full shadow-md border border-blue-100">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                            <span className="text-blue-600 font-semibold text-base">
                                {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} Available
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            {isModalOpen && modalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">
                                    {modalData.isEditing ? 'Edit FAQ' : 'Create New FAQ'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Question <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={modalData.question}
                                    onChange={(e) => setModalData({
                                        id: modalData.id,
                                        question: e.target.value,
                                        answer: modalData.answer,
                                        isEditing: modalData.isEditing
                                    })}
                                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base"
                                    placeholder="Enter your question here..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Answer <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={modalData.answer}
                                    onChange={(e) => setModalData({
                                        id: modalData.id,
                                        question: modalData.question,
                                        answer: e.target.value,
                                        isEditing: modalData.isEditing
                                    })}
                                    rows={6}
                                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none text-base"
                                    placeholder="Provide a detailed answer here..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-8 py-6 flex justify-end space-x-4">
                            <button
                                onClick={closeModal}
                                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200 text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!modalData.question.trim() || !modalData.answer.trim()}
                                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed text-base"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {modalData.isEditing ? 'Update FAQ' : 'Create FAQ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}