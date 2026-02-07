import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, GraduationCap, Plus, Loader2, Calendar, Trash2, Edit2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const AcademicManager = ({ onNavigate }) => {
    const { workspace } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('courses'); // courses, exams
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({});
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Dropdown Data
    const [depts, setDepts] = useState([]);
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        if (workspace) {
            fetchData();
            fetchDropdownData();
        }
    }, [workspace, activeTab]);

    const fetchDropdownData = async () => {
        try {
            if (activeTab === 'courses') {
                const [deptRes, progRes] = await Promise.all([
                    axios.get(`${API_URL}/workspaces/${workspace.id}/departments`),
                    axios.get(`${API_URL}/workspaces/${workspace.id}/programs`)
                ]);
                setDepts(deptRes.data);
                setPrograms(progRes.data);
            } else {
                const [courseRes, progRes] = await Promise.all([
                    axios.get(`${API_URL}/workspaces/${workspace.id}/courses`),
                    axios.get(`${API_URL}/workspaces/${workspace.id}/programs`)
                ]);
                setCourses(courseRes.data);
                setPrograms(progRes.data);
            }
        } catch (err) { console.error("Dropdown fetch error", err); }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/workspaces/${workspace.id}/${activeTab}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await axios.post(`${API_URL}/workspaces/${workspace.id}/${activeTab}`, {
                ...newItem, workspace_id: workspace.id
            });
            setNewItem({});
            fetchData();
        } catch (err) {
            showToast(`Failed to create ${activeTab === 'courses' ? 'course' : 'exam'}`, "error");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_URL}/workspaces/${workspace.id}/${activeTab}/${id}`);
            fetchData();
        } catch (err) { showToast("Delete failed", "error"); }
    };

    const startEdit = (e, item) => {
        e.stopPropagation();
        setEditingId(item._id || item.id);
        setEditData({ ...item });
    };

    const cancelEdit = (e) => {
        e && e.stopPropagation();
        setEditingId(null);
        setEditData({});
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/workspaces/${workspace.id}/${activeTab}/${editingId}`, editData);
            setEditingId(null);
            fetchData();
            showToast(`${activeTab === 'courses' ? 'Course' : 'Exam'} updated`, "success");
        } catch (err) {
            showToast("Update failed", "error");
        }
    };

    // Redirect handler for dropdowns
    const handleDeptChange = (e) => {
        if (e.target.value === 'new') {
            if (onNavigate) onNavigate('departments');
        } else {
            setNewItem({ ...newItem, department_id: e.target.value });
        }
    };

    const handleCourseChange = (e) => {
        if (e.target.value === 'new') {
            if (onNavigate) onNavigate('academics'); // Effectively reload to 'courses' tab context
            setActiveTab('courses');
        } else {
            setNewItem({ ...newItem, course_code: e.target.value });
        }
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Sub-Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/10">
                <button onClick={() => setActiveTab('courses')} className={`pb-2 px-1 text-sm font-medium flex items-center gap-2 ${activeTab === 'courses' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>
                    <BookOpen className="w-4 h-4" /> Courses
                </button>
                <button onClick={() => setActiveTab('exams')} className={`pb-2 px-1 text-sm font-medium flex items-center gap-2 ${activeTab === 'exams' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>
                    <GraduationCap className="w-4 h-4" /> Exams
                </button>
            </div>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 flex flex-wrap gap-4 items-end">
                {activeTab === 'courses' ? (
                    <>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs text-gray-400 mb-1">Course Code</label>
                            <input value={newItem.code || ''} onChange={e => setNewItem({ ...newItem, code: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="CS101" required />
                        </div>
                        <div className="flex-[2] min-w-[200px]">
                            <label className="block text-xs text-gray-400 mb-1">Course Name</label>
                            <input value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="Intro to Programming" required />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs text-gray-400 mb-1">Department</label>
                            <select
                                value={newItem.department_id || ''}
                                onChange={handleDeptChange}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm"
                                required
                            >
                                <option value="" disabled>Select Dept</option>
                                {depts.map(d => <option key={d._id || d.id} value={d.id}>{d.name} ({d.id})</option>)}
                                <option value="new" className="text-blue-400 font-bold">+ Create New Dept</option>
                            </select>
                        </div>
                        <div className="w-40">
                            <label className="block text-xs text-gray-400 mb-1">Program</label>
                            <select value={newItem.program_code || ''} onChange={e => setNewItem({ ...newItem, program_code: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm">
                                <option value="">Select</option>
                                {programs.map(p => <option key={p._id} value={p.code}>{p.name}</option>)}
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs text-gray-400 mb-1">Course</label>
                            <select
                                value={newItem.course_code || ''}
                                onChange={handleCourseChange}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm"
                                required
                            >
                                <option value="" disabled>Select Course</option>
                                {courses.map(c => <option key={c._id || c.id} value={c.code}>{c.name} ({c.code})</option>)}
                                <option value="new" className="text-blue-400 font-bold">+ Create New Course</option>
                            </select>
                        </div>
                        <div className="flex-[2] min-w-[200px]">
                            <label className="block text-xs text-gray-400 mb-1">Exam Name</label>
                            <input value={newItem.course_name || ''} onChange={e => setNewItem({ ...newItem, course_name: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="Midterm Exam" required />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Duration (Min)</label>
                            <input type="number" value={newItem.duration_minutes || 180} onChange={e => setNewItem({ ...newItem, duration_minutes: Number(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="180" required />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs text-gray-400 mb-1">Program</label>
                            <select value={newItem.program_code || ''} onChange={e => setNewItem({ ...newItem, program_code: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm">
                                <option value="">Select</option>
                                {programs.map(p => <option key={p._id} value={p.code}>{p.name}</option>)}
                            </select>
                        </div>
                    </>
                )}
                <button disabled={creating} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg h-[38px] flex items-center gap-2">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
                </button>
            </form>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((item) => (
                        <div key={item._id || item.id} className="bg-white/5 border border-white/10 p-4 rounded-lg hover:border-blue-500/30 transition-colors group relative">
                            {editingId === (item._id || item.id) ? (
                                <form onSubmit={submitEdit} onClick={e => e.stopPropagation()} className="space-y-3">
                                    {activeTab === 'courses' ? (
                                        <>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Course Code</label>
                                                <input value={editData.code || ''} onChange={e => setEditData({ ...editData, code: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Course Name</label>
                                                <input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Department</label>
                                                <input value={editData.department_id || ''} onChange={e => setEditData({ ...editData, department_id: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Program</label>
                                                <input value={editData.program_code || ''} onChange={e => setEditData({ ...editData, program_code: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Course Code</label>
                                                <input value={editData.course_code || ''} onChange={e => setEditData({ ...editData, course_code: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Exam Name</label>
                                                <input value={editData.course_name || ''} onChange={e => setEditData({ ...editData, course_name: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Duration (Min)</label>
                                                <input type="number" value={editData.duration_minutes || 180} onChange={e => setEditData({ ...editData, duration_minutes: Number(e.target.value) })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Program</label>
                                                <input value={editData.program_code || ''} onChange={e => setEditData({ ...editData, program_code: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" />
                                            </div>
                                        </>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" onClick={e => e.stopPropagation()} className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm font-medium transition-colors">Save</button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); cancelEdit(e); }} className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm font-medium transition-colors">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {/* Edit & Delete Buttons */}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => startEdit(e, item)}
                                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, item._id || item.id)}
                                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-start mb-2 pr-8">
                                        <span className="font-mono text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                                            {item.code || item.course_code}
                                        </span>
                                        {item.duration_minutes && <span className="text-xs text-gray-500">{item.duration_minutes} min</span>}
                                    </div>
                                    <h4 className="font-semibold text-white">{item.name || item.course_name}</h4>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {item.department_id && <span>Dept: {item.department_id}</span>}
                                        {item.program_code && <span className="ml-2">• {item.program_code} </span>}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {data.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No records found.</div>}
                </div>
            )}
        </div>
    );
};

export default AcademicManager;
