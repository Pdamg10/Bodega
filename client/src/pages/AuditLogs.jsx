import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Filter, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        table_name: '',
        username: '',
    });
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.table_name) params.append('table_name', filters.table_name);
            if (filters.username) params.append('username', filters.username);

            const res = await axios.get(`http://localhost:3001/api/audit?${params.toString()}`);
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Error loading audit logs');
        }
        setLoading(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const applyFilters = () => {
        fetchLogs();
    };

    const clearFilters = () => {
        setFilters({ action: '', table_name: '', username: '' });
        setTimeout(() => fetchLogs(), 100);
    };

    const viewDetails = (log) => {
        setSelectedLog(log);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700';
            case 'UPDATE': return 'bg-blue-100 text-blue-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            case 'LOGIN': return 'bg-purple-100 text-purple-700';
            case 'LOGIN_FAILED': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Audit Logs</h1>
                <div className="flex gap-2">
                    <button
                        onClick={applyFilters}
                        className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <Filter size={18} />
                        Apply Filters
                    </button>
                    <button
                        onClick={clearFilters}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <select
                        value={filters.action}
                        onChange={(e) => handleFilterChange('action', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGIN_FAILED">Login Failed</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                    <select
                        value={filters.table_name}
                        onChange={(e) => handleFilterChange('table_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    >
                        <option value="">All Tables</option>
                        <option value="Products">Products</option>
                        <option value="Movements">Movements</option>
                        <option value="Users">Users</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        value={filters.username}
                        onChange={(e) => handleFilterChange('username', e.target.value)}
                        placeholder="Search by username..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Timestamp</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">User</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Action</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Table</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">IP</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center">Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No logs found</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(log.createdAt)}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{log.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{log.table_name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-xs">{log.description}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">{log.ip_address || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => viewDetails(log)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                                <FileText size={24} />
                                Audit Log Details
                            </h2>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">User</p>
                                    <p className="text-base font-semibold text-gray-900">{selectedLog.username}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Action</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getActionBadgeColor(selectedLog.action)}`}>
                                        {selectedLog.action}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Table</p>
                                    <p className="text-base text-gray-900">{selectedLog.table_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Row ID</p>
                                    <p className="text-base text-gray-900">{selectedLog.row_id || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Timestamp</p>
                                    <p className="text-base text-gray-900">{formatDate(selectedLog.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">IP Address</p>
                                    <p className="text-base font-mono text-gray-900">{selectedLog.ip_address || 'Unknown'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                                <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedLog.description}</p>
                            </div>

                            {selectedLog.before_value && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Before</p>
                                    <pre className="text-sm bg-red-50 p-3 rounded-lg overflow-x-auto text-red-900">
                                        {JSON.stringify(JSON.parse(selectedLog.before_value), null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.after_value && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">After</p>
                                    <pre className="text-sm bg-green-50 p-3 rounded-lg overflow-x-auto text-green-900">
                                        {JSON.stringify(JSON.parse(selectedLog.after_value), null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
