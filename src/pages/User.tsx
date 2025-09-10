import { Users, Shield, ShieldCheck, CreditCard, Phone, Mail, Ban, UserCheck, Search, Filter, MoreVertical } from "lucide-react";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  banned: boolean;
  plan: 'Free' | 'Basic' | 'Premium' | 'Enterprise';
  accountCreated: string;
  avatar: string;
}

const initialUsers: User[] = [
  { 
    id: 1, 
    name: "Alice Johnson", 
    email: "alice@example.com", 
    phone: "+1 234 567 8901",
    banned: false,
    plan: 'Premium',
    accountCreated: '2024-01-15',
    avatar: 'AJ'
  },
  { 
    id: 2, 
    name: "Bob Smith", 
    email: "bob@example.com", 
    phone: "+1 234 567 8902",
    banned: false,
    plan: 'Basic',
    accountCreated: '2024-03-22',
    avatar: 'BS'
  },
  { 
    id: 3, 
    name: "Charlie Brown", 
    email: "charlie@example.com", 
    phone: "+1 234 567 8903",
    banned: true,
    plan: 'Free',
    accountCreated: '2024-02-10',
    avatar: 'CB'
  },
  { 
    id: 4, 
    name: "Diana Prince", 
    email: "diana@example.com", 
    phone: "+1 234 567 8904",
    banned: false,
    plan: 'Enterprise',
    accountCreated: '2023-12-05',
    avatar: 'DP'
  },
  { 
    id: 5, 
    name: "Edward Wilson", 
    email: "edward@example.com", 
    phone: "+1 234 567 8905",
    banned: false,
    plan: 'Premium',
    accountCreated: '2024-04-18',
    avatar: 'EW'
  }
];

export default function UserPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const banUser = (id: number) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      setUsers(users.map(user =>
        user.id === id ? { ...user, banned: true } : user
      ));
    }
  };

  const unbanUser = (id: number) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, banned: false } : user
    ));
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Free': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Basic': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Premium': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Enterprise': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
    return days;
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "All" || user.plan === filterPlan;
    const matchesStatus = filterStatus === "All" || 
                         (filterStatus === "Active" && !user.banned) ||
                         (filterStatus === "Banned" && user.banned);
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => !u.banned).length,
    banned: users.filter(u => u.banned).length,
    premium: users.filter(u => u.plan === 'Premium' || u.plan === 'Enterprise').length
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 text-lg mt-1">Manage and monitor your users</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Banned Users</p>
                  <p className="text-3xl font-bold text-red-600">{stats.banned}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Premium Users</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.premium}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  <option value="All">All Plans</option>
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="relative">
                <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Banned">Banned Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Account Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(user.plan)}`}>
                        <CreditCard className="w-3 h-3 mr-1" />
                        {user.plan}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {user.banned ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                          <Ban className="w-3 h-3 mr-1" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatDate(user.accountCreated)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getDaysAgo(user.accountCreated)} days ago
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user.banned ? (
                          <button
                            onClick={() => unbanUser(user.id)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => banUser(user.id)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}