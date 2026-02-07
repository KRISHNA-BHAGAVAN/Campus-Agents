import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Building2, ChevronRight, Loader2, Users, Edit2, Trash2 } from 'lucide-react';

const WorkspaceSelector = () => {
    const { selectWorkspace, logout, user } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newWsName, setNewWsName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const res = await axios.get('http://localhost:8000/workspaces');
            setWorkspaces(res.data);
        } catch (err) {
            console.error("Failed to fetch workspaces", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newWsName.trim()) return;

        setCreating(true);
        try {
            const res = await axios.post('http://localhost:8000/workspaces', { name: newWsName });
            setWorkspaces([...workspaces, res.data]);
            setNewWsName('');
        } catch (err) {
            console.error("Failed to create workspace", err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (e, wsId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this workspace? All data will be lost.")) return;
        try {
            await axios.delete(`http://localhost:8000/workspaces/${wsId}`);
            setWorkspaces(workspaces.filter(w => w.id !== wsId));
        } catch (err) {
            console.error("Failed to delete workspace", err);
        }
    };

    const startEdit = (e, ws) => {
        e.stopPropagation();
        setEditingId(ws.id);
        setEditName(ws.name);
    };

    const cancelEdit = (e) => {
        e && e.stopPropagation();
        setEditingId(null);
        setEditName('');
    };

    const submitEdit = async (e, wsId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.put(`http://localhost:8000/workspaces/${wsId}`, { name: editName });
            setWorkspaces(workspaces.map(w => w.id === wsId ? { ...w, name: editName } : w));
            setEditingId(null);
        } catch (err) {
            console.error("Failed to update workspace", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Select Workspace</h1>
                        <p className="text-gray-400">Choose a workspace to continue or create a new one.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                        Log out
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Create New Card */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-400" />
                                Create New
                            </h3>
                            <form onSubmit={handleCreate} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Workspace Name"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={creating || !newWsName.trim()}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Workspace'}
                                </button>
                            </form>
                        </div>

                        {/* Existing Workspaces */}
                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                className="group flex flex-col items-start bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all relative overflow-hidden"
                            >
                                {editingId === ws.id ? (
                                    <form onSubmit={(e) => submitEdit(e, ws.id)} onClick={e => e.stopPropagation()} className="w-full space-y-3">
                                        <label className="text-xs text-gray-400 block">Workspace Name</label>
                                        <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm font-medium transition-colors">Save</button>
                                            <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm font-medium transition-colors">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {ws.is_owner && (
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button onClick={(e) => startEdit(e, ws)} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" title="Edit">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={(e) => handleDelete(e, ws.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Delete">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => selectWorkspace(ws)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-center justify-between w-full mb-2">
                                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                {ws.is_owner && (
                                                    <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">
                                                        Owner
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-lg">{ws.name}</h3>
                                            <p className="text-sm text-gray-400 mt-1">ID: {ws.id.slice(0, 8)}...</p>

                                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                <ChevronRight className="w-5 h-5 text-blue-400" />
                                            </div>
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}

                        {workspaces.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                No workspaces found. Create one to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceSelector;
