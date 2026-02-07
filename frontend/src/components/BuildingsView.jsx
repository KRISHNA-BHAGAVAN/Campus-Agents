import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Building2, Search, Plus, MapPin, ArrowRight, Loader2, Castle, LandPlot, Trash2, Edit2 } from 'lucide-react';
import RoomView from './RoomView';


const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Placeholder gradients for "Fantasy Illustrations"
const cardGradients = [
    "from-purple-900 to-indigo-900",
    "from-blue-900 to-slate-900",
    "from-emerald-900 to-teal-900",
    "from-rose-900 to-pink-900",
    "from-amber-900 to-orange-900",
];

const BuildingsView = ({ onNavigate }) => {
    const { workspace } = useAuth();
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    // New Building Form State
    const [newBldg, setNewBldg] = useState({ id: "", name: "" });
    const [creating, setCreating] = useState(false);
    const [editingBuildingId, setEditingBuildingId] = useState(null);
    const [editBuildingData, setEditBuildingData] = useState({ id: "", name: "" });

    useEffect(() => {
        if (workspace) fetchBuildings();
    }, [workspace]);

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/workspaces/${workspace.id}/buildings`);
            setBuildings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newBldg.id || !newBldg.id.trim() || !newBldg.name || !newBldg.name.trim()) {
            showToast("Please provide both structure code and name", "error");
            return;
        }
        setCreating(true);
        try {
            await axios.post(`${API_URL}/workspaces/${workspace.id}/buildings`, {
                ...newBldg, workspace_id: workspace.id
            });
            setNewBldg({ id: "", name: "" });
            setShowCreate(false);
            fetchBuildings();
        } catch (err) {
            console.error(err);
            showToast("Failed to create building", "error");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Delete this building and all its halls?")) return;
        try {
            if (!id) {
                // Use query-based delete for empty string ids
                await axios.delete(`${API_URL}/workspaces/${workspace.id}/buildings`, { params: { id: id } });
            } else {
                await axios.delete(`${API_URL}/workspaces/${workspace.id}/buildings/${id}`);
            }
            fetchBuildings();
        } catch (err) { console.error(err); showToast("Delete failed", "error"); }
    }

    const startEditBuilding = (e, b) => {
        e.stopPropagation();
        setEditingBuildingId(b.id);
        setEditBuildingData({ id: b.id, name: b.name });
    }

    const cancelEditBuilding = (e) => {
        e && e.stopPropagation();
        setEditingBuildingId(null);
        setEditBuildingData({ id: "", name: "" });
    }

    const submitEditBuilding = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/workspaces/${workspace.id}/buildings/${editingBuildingId}`, editBuildingData);
            setEditingBuildingId(null);
            fetchBuildings();
            showToast("Building updated", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to update building", "error");
        }
    }

    if (selectedBuilding) {
        return <RoomSelectionView building={selectedBuilding} onBack={() => setSelectedBuilding(null)} />;
    }

    const filteredBuildings = buildings.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center bg-black rounded-lg border border-white/10">
                        <Search className="w-5 h-5 text-gray-400 ml-3" />
                        <input
                            type="text"
                            placeholder="Search structures..."
                            className="w-full bg-transparent text-white px-3 py-2.5 focus:outline-none placeholder:text-gray-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="relative px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.7)] transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Summon Structure</span>
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white/5 border border-purple-500/30 p-4 rounded-xl flex gap-4 items-end animate-in slide-in-from-top-4">
                    <div className="flex-1">
                        <label className="text-xs text-purple-300 mb-1 block">Structure Code</label>
                        <input value={newBldg.id} onChange={e => setNewBldg({ ...newBldg, id: e.target.value })} className="w-full bg-black/40 border border-purple-500/20 rounded p-2 text-white" placeholder="e.g. TWR-1" />
                    </div>
                    <div className="flex-[2]">
                        <label className="text-xs text-purple-300 mb-1 block">Structure Name</label>
                        <input value={newBldg.name} onChange={e => setNewBldg({ ...newBldg, name: e.target.value })} className="w-full bg-black/40 border border-purple-500/20 rounded p-2 text-white" placeholder="e.g. Tower of Wisdom" />
                    </div>
                    <button disabled={creating} type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500">
                        {creating ? <Loader2 className="animate-spin" /> : "Bind"}
                    </button>
                </form>
            )}

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {filteredBuildings.map((b, idx) => (
                        <div
                            key={b.id}
                            onClick={() => { if (!editingBuildingId) setSelectedBuilding(b); }}
                            className="group relative bg-gray-900 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Edit & Delete Buttons */}
                            <div className="absolute top-2 right-2 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => startEditBuilding(e, b)}
                                    className="p-2 rounded-full bg-black/50 text-white/50 hover:bg-indigo-600 hover:text-white transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, b.id)}
                                    className="p-2 rounded-full bg-black/50 text-white/50 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* If editing this building, show inline edit form */}
                            {editingBuildingId === b.id ? (
                                <form onSubmit={submitEditBuilding} onClick={e => e.stopPropagation()} className="p-6 bg-gray-800/90 min-h-[280px] flex flex-col justify-center">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Structure Code</label>
                                            <input value={editBuildingData.id} onChange={e => setEditBuildingData({ ...editBuildingData, id: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Structure Name</label>
                                            <input value={editBuildingData.name} onChange={e => setEditBuildingData({ ...editBuildingData, name: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" onClick={e => e.stopPropagation()} className="flex-1 bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-medium transition-colors">Save</button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); cancelEditBuilding(e); }} className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm font-medium transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {/* Image Placeholder */}
                                    <div className={`h-40 bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} flex items-center justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
                                        <Castle className="w-16 h-16 text-white/20 group-hover:text-white/40 transform group-hover:scale-110 transition-all duration-500" />
                                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900 to-transparent"></div>
                                        <div className="absolute bottom-3 left-4">
                                            <h3 className="text-xl font-bold text-white shadow-sm">{b.name}</h3>
                                            <span className="text-xs text-white/60 font-mono tracking-wider">{b.id}</span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-4 relative">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-2">
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><LandPlot className="w-3 h-3" /> Tap to Explore</span>
                                            <ArrowRight className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {filteredBuildings.length === 0 && !loading && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No structures found in this realm.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Sub-view: List Halls in a Building
const RoomSelectionView = ({ building, onBack }) => {
    const { workspace } = useAuth();
    const [halls, setHalls] = useState([]);
    const [selectedHall, setSelectedHall] = useState(null);
    const [loading, setLoading] = useState(true);

    const [newHall, setNewHall] = useState({ id: "", name: "", capacity: 60, rows: 10, columns: 6 });
    const [creating, setCreating] = useState(false);
    const [editingHallId, setEditingHallId] = useState(null);
    const [editHallData, setEditHallData] = useState({ id: "", name: "", capacity: 60, rows: 10, columns: 6 });

    useEffect(() => {
        fetchHalls();
    }, [building]);

    const fetchHalls = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/workspaces/${workspace.id}/buildings/${building.id}/halls`);
            setHalls(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHall = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await axios.post(`${API_URL}/workspaces/${workspace.id}/halls`, {
                ...newHall, building_id: building.id, workspace_id: workspace.id
            });
            setNewHall({ id: "", name: "", capacity: 60, rows: 10, columns: 6 });
            fetchHalls();
        } catch (err) {
            showToast("Failed to create hall", "error");
        } finally {
            setCreating(false);
        }
    }

    const handleDeleteHall = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Delete this hall?")) return;
        try {
            if (!id) {
                await axios.delete(`${API_URL}/workspaces/${workspace.id}/halls`, { params: { id } });
            } else {
                await axios.delete(`${API_URL}/workspaces/${workspace.id}/halls/${id}`);
            }
            fetchHalls();
        } catch (err) { showToast("Delete failed", "error"); }
    }

    const startEditHall = (e, h) => {
        e.stopPropagation();
        setEditingHallId(h.id);
        setEditHallData({ id: h.id, name: h.name, capacity: h.capacity, rows: h.rows || 10, columns: h.columns || 6 });
    }

    const cancelEditHall = (e) => {
        e && e.stopPropagation();
        setEditingHallId(null);
        setEditHallData({ id: "", name: "", capacity: 60, rows: 10, columns: 6 });
    }

    const submitEditHall = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/workspaces/${workspace.id}/halls/${editingHallId}`, editHallData);
            setEditingHallId(null);
            fetchHalls();
            showToast("Hall updated", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to update hall", "error");
        }
    }

    if (selectedHall) {
        return <RoomView hall={selectedHall} building={building} onBack={() => setSelectedHall(null)} />;
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Campus Map
            </button>

            <h2 className="text-3xl font-bold text-white mb-2">{building.name} <span className="text-gray-500 text-lg font-normal">({building.id})</span></h2>
            <p className="text-gray-400 mb-8 max-w-2xl">Select a chamber to view seating arrangements or bind new rooms to this structure.</p>

            {/* Create Hall Inline */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8">
                <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Add New Chamber</h4>
                <form onSubmit={handleCreateHall} className="flex gap-4 items-end flex-wrap">
                    <input className="bg-black/20 border-white/10 rounded p-2 text-white text-sm" placeholder="ID (e.g. 101)" value={newHall.id} onChange={e => setNewHall({ ...newHall, id: e.target.value })} required pattern="\d{3}" title="3 digit number" />
                    <input className="bg-black/20 border-white/10 rounded p-2 text-white text-sm flex-1 min-w-[200px]" placeholder="Name (e.g. Grand Lecture Hall)" value={newHall.name} onChange={e => setNewHall({ ...newHall, name: e.target.value })} required />
                    <input type="number" className="bg-black/20 border-white/10 rounded p-2 text-white text-sm w-20" placeholder="Rows" value={newHall.rows} onChange={e => setNewHall({ ...newHall, rows: Number(e.target.value) })} required />
                    <input type="number" className="bg-black/20 border-white/10 rounded p-2 text-white text-sm w-20" placeholder="Cols" value={newHall.columns} onChange={e => setNewHall({ ...newHall, columns: Number(e.target.value) })} required />
                    <input type="number" className="bg-black/20 border-white/10 rounded p-2 text-white text-sm w-24" placeholder="Cap" value={newHall.capacity} onChange={e => setNewHall({ ...newHall, capacity: Number(e.target.value) })} required />
                    <button disabled={creating} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm">{creating ? "..." : "Add"}</button>
                </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center p-20"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>
                ) : (
                    <>
                        {halls.map((h, i) => (
                    <div
                        key={h.id}
                        onClick={() => { if (!editingHallId) setSelectedHall(h); }}
                        className="bg-gray-800/50 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/50 p-6 rounded-xl cursor-pointer transition-all group relative"
                    >
                        {/* Edit & Delete Buttons */}
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => startEditHall(e, h)} className="p-1.5 rounded-full bg-black/50 text-white/50 hover:bg-indigo-600 hover:text-white transition-colors">
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                                onClick={(e) => handleDeleteHall(e, h.id)}
                                className="p-1.5 rounded-full bg-black/50 text-white/50 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>

                        {editingHallId === h.id ? (
                            <form onSubmit={submitEditHall} onClick={e => e.stopPropagation()} className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Hall ID</label>
                                    <input value={editHallData.id} onChange={e => setEditHallData({ ...editHallData, id: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required pattern="\d{3}" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Hall Name</label>
                                    <input value={editHallData.name} onChange={e => setEditHallData({ ...editHallData, name: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Rows & Columns</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={editHallData.rows} onChange={e => setEditHallData({ ...editHallData, rows: Number(e.target.value) })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" placeholder="Rows" />
                                        <input type="number" value={editHallData.columns} onChange={e => setEditHallData({ ...editHallData, columns: Number(e.target.value) })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" placeholder="Cols" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Capacity</label>
                                    <input type="number" value={editHallData.capacity} onChange={e => setEditHallData({ ...editHallData, capacity: Number(e.target.value) })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="submit" onClick={e => e.stopPropagation()} className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm font-medium transition-colors">Save</button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); cancelEditHall(e); }} className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm font-medium transition-colors">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                        <span className="font-mono font-bold text-lg">{h.id}</span>
                                    </div>
                                    <span className="bg-white/5 text-xs px-2 py-1 rounded text-gray-400">{h.capacity} Seats</span>
                                </div>
                                <h4 className="font-semibold text-white">{h.name}</h4>
                            </>
                        )}
                    </div>
                        ))}
                        {halls.length === 0 && <div className="col-span-full text-center py-8 text-gray-500 italic">No halls recorded in this building.</div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default BuildingsView;
