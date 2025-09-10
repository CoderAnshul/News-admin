import React, { useState } from "react";
import { Plus, X, Check, Zap } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  heading: string;
  realPrice: number;
  discountedPrice: number;
  duration: number;
  perks: string[];
  description: string;
  isPopular?: boolean;
}

export default function SubscriptionPlan() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: "Starter",
      heading: "Perfect for beginners",
      realPrice: 29.99,
      discountedPrice: 19.99,
      duration: 1,
      perks: ["5 Projects", "Basic Support", "1GB Storage", "Email Integration"],
      description: "Everything you need to get started",
      isPopular: false
    },
    {
      id: 2,
      name: "Professional",
      heading: "Most Popular",
      realPrice: 99.99,
      discountedPrice: 79.99,
      duration: 12,
      perks: ["Unlimited Projects", "Priority Support", "100GB Storage", "Advanced Analytics", "API Access", "Team Collaboration"],
      description: "Perfect for growing businesses",
      isPopular: true
    },
    {
      id: 3,
      name: "Enterprise",
      heading: "Best Value",
      realPrice: 199.99,
      discountedPrice: 149.99,
      duration: 12,
      perks: ["Everything in Professional", "Custom Integrations", "Unlimited Storage", "24/7 Phone Support", "White-label Solution", "Dedicated Account Manager"],
      description: "For large organizations",
      isPopular: false
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    heading: string;
    realPrice: string;
    discountedPrice: string;
    duration: string;
    perks: string;
    description: string;
    isPopular: boolean;
  }>({
    name: "",
    heading: "",
    realPrice: "",
    discountedPrice: "",
    duration: "",
    perks: "",
    description: "",
    isPopular: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.heading.trim() || !form.realPrice.trim() || !form.discountedPrice.trim() || !form.duration.trim()) return;
    
    const perksArray = form.perks
      .split('\n')
      .map(perk => perk.trim())
      .filter(perk => perk !== '');

    setPlans([
      ...plans,
      {
        id: Date.now(),
        name: form.name.trim(),
        heading: form.heading.trim(),
        realPrice: parseFloat(form.realPrice),
        discountedPrice: parseFloat(form.discountedPrice),
        duration: parseInt(form.duration),
        perks: perksArray,
        description: form.description.trim(),
        isPopular: form.isPopular,
      },
    ]);
    setForm({
      name: "",
      heading: "",
      realPrice: "",
      discountedPrice: "",
      duration: "",
      perks: "",
      description: "",
      isPopular: false,
    });
    setIsModalOpen(false);
  };

  const calculateSavings = (realPrice: number, discountedPrice: number) => {
    const savings = realPrice - discountedPrice;
    const percentage = ((savings / realPrice) * 100).toFixed(0);
    return { savings, percentage };
  };

  const deletePlan = (id: number) => {
    setPlans(plans.filter(plan => plan.id !== id));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className=" mx-auto">
        <div className="text-center flex items-center justify-between flex-wrap mb-6">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-300 bg-clip-text text-transparent">
            Choose Your Plan
          </h1> 
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create New Plan
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-full mx-auto">
          {plans.map((plan) => {
            const { savings, percentage } = calculateSavings(plan.realPrice, plan.discountedPrice);
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.isPopular ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
              >

                {/* Delete Button */}
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>

                {/* Plan Header */}
                <div className={`${plan.isPopular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-gray-800 to-gray-900'} text-white p-8 pb-12`}>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-blue-100 opacity-90">{plan.heading}</p>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="px-8 -mt-6 relative z-10">
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center border">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.discountedPrice.toFixed(2)}
                      </span>
                      {plan.realPrice > plan.discountedPrice && (
                        <span className="text-xl text-gray-400 line-through">
                          ${plan.realPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">
                      per {plan.duration === 1 ? 'month' : `${plan.duration} months`}
                    </p>
                    {savings > 0 && (
                      <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <Zap size={14} />
                        Save {percentage}% (${savings.toFixed(2)})
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Content */}
                <div className="p-8">
                  {/* Description */}
                  {plan.description && (
                    <p className="text-gray-600 text-center mb-6 italic">
                      {plan.description}
                    </p>
                  )}

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Check size={18} className="text-green-500" />
                      Everything included:
                    </h4>
                    <ul className="space-y-3">
                      {plan.perks.map((perk, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <Check size={12} className="text-green-600" />
                          </div>
                          <span className="text-gray-700">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                  }`}>
                    Get Started
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[1000005]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Plan</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-blue-100 mt-2">Design your perfect subscription plan</p>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Premium Plan"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Heading</label>
                  <input
                    name="heading"
                    value={form.heading}
                    onChange={handleChange}
                    placeholder="e.g., Most Popular"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price ($)</label>
                  <input
                    name="realPrice"
                    value={form.realPrice}
                    onChange={handleChange}
                    placeholder="99.99"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discounted Price ($)</label>
                  <input
                    name="discountedPrice"
                    value={form.discountedPrice}
                    onChange={handleChange}
                    placeholder="79.99"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Months)</label>
                  <input
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="12"
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Perfect for growing businesses"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Features (One per line)</label>
                  <textarea
                    name="perks"
                    value={form.perks}
                    onChange={handleChange}
                    placeholder="Unlimited storage&#10;24/7 support&#10;Advanced analytics&#10;Priority processing"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={form.isPopular}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Mark as Popular Plan</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}