import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Plus, Loader2, Upload, Edit2, Trash2, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const StudentsManager = () => {
    const { workspace } = useAuth();
    const { showToast } = useToast();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newStudent, setNewStudent] = useState({ id: '', name: '', department_id: '', program: '', enrolled_courses: [] });
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [importing, setImporting] = useState(false);
    const [depts, setDepts] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (workspace) {
            fetchStudents();
            fetchDepartments();
            fetchPrograms();
            fetchCourses();
        }
    }, [workspace]);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get(`${API_URL}/workspaces/${workspace.id}/departments`);
            setDepts(res.data);
        } catch (err) { console.error("Dept fetch error", err); }
    };

    const fetchPrograms = async () => {
        try {
            const res = await axios.get(`${API_URL}/workspaces/${workspace.id}/programs`);
            setPrograms(res.data);
        } catch (err) { console.error("Program fetch error", err); }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/workspaces/${workspace.id}/courses`);
            setCourses(res.data);
        } catch (err) { console.error("Course fetch error", err); }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/workspaces/${workspace.id}/students`);
            setStudents(res.data);
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
            await axios.post(`${API_URL}/workspaces/${workspace.id}/students`, {
                ...newStudent,
                workspace_id: workspace.id
            });
            setNewStudent({ id: '', name: '', department_id: '', program: '', enrolled_courses: [] });
            fetchStudents();
            showToast("Student added", "success");
        } catch (err) {
            showToast("Failed to add student", "error");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Delete this student?")) return;
        try {
            await axios.delete(`${API_URL}/workspaces/${workspace.id}/students/${id}`);
            fetchStudents();
            showToast("Student deleted", "success");
        } catch (err) { showToast("Delete failed", "error"); }
    };

    const startEdit = (e, student) => {
        e.stopPropagation();
        setEditingId(student._id || student.id);
        setEditData({ ...student });
    };

    const cancelEdit = (e) => {
        e && e.stopPropagation();
        setEditingId(null);
        setEditData({});
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/workspaces/${workspace.id}/students/${editingId}`, editData);
            setEditingId(null);
            fetchStudents();
            showToast("Student updated", "success");
        } catch (err) {
            showToast("Update failed", "error");
        }
    };

    const getFilteredCourses = (deptId, programCode) => {
        if (!deptId || !programCode) return courses;
        return courses.filter(c => c.department_id === deptId && c.program_code === programCode);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_URL}/workspaces/${workspace.id}/students/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast(res.data.message, "success");
            fetchStudents();
        } catch (err) {
            showToast(err.response?.data?.detail || "Import failed", "error");
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const downloadTemplate = () => {
        const template = "id,name,department_id,program,enrolled_courses\nS001,John Doe,CSE,B.Tech,CS101,CS102\nS002,Jane Smith,ECE,B.Tech,EC101";
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_template.csv';
        a.click();
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6" /> Students
                </h2>
                <div className="flex gap-2">
                    <button onClick={downloadTemplate} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <Download className="w-4 h-4" /> Template
                    </button>
                    <label className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer">
                        {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Import Excel
                        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" disabled={importing} />
                    </label>
                </div>
            </div>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
                <input value={newStudent.id} onChange={e => setNewStudent({ ...newStudent, id: e.target.value })} className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="Roll No" required />
                <input value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="Name" required />
                <select value={newStudent.department_id} onChange={e => setNewStudent({ ...newStudent, department_id: e.target.value })} className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" required>
                    <option value="">Select Dept</option>
                    {depts.map(d => <option key={d._id || d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={newStudent.program} onChange={e => setNewStudent({ ...newStudent, program: e.target.value })} className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" required>
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p._id} value={p.code}>{p.name}</option>)}
                </select>
                <div className="relative">
                    <select 
                        value="" 
                        onChange={e => {
                            if (e.target.value && !newStudent.enrolled_courses.includes(e.target.value)) {
                                setNewStudent({ ...newStudent, enrolled_courses: [...newStudent.enrolled_courses, e.target.value] });
                            }
                        }} 
                        className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm w-full"
                    >
                        <option value="">Add Course</option>
                        {getFilteredCourses(newStudent.department_id, newStudent.program).map(c => <option key={c._id} value={c.code}>{c.name}</option>)}
                    </select>
                    {newStudent.enrolled_courses.length > 0 && (
                        <div className="absolute -bottom-6 left-0 text-xs text-gray-400 flex gap-1 flex-wrap">
                            {newStudent.enrolled_courses.map(code => (
                                <span key={code} className="bg-blue-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                    {code}
                                    <button type="button" onClick={() => setNewStudent({ ...newStudent, enrolled_courses: newStudent.enrolled_courses.filter(c => c !== code) })} className="text-red-400 hover:text-red-300">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <button disabled={creating} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
                </button>
            </form>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                        <div key={student._id || student.id} className="bg-white/5 border border-white/10 p-4 rounded-lg hover:border-blue-500/30 transition-colors group relative">
                            {editingId === (student._id || student.id) ? (
                                <form onSubmit={submitEdit} onClick={e => e.stopPropagation()} className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Roll No</label>
                                        <input value={editData.id} onChange={e => setEditData({ ...editData, id: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Name</label>
                                        <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Department</label>
                                        <select value={editData.department_id} onChange={e => setEditData({ ...editData, department_id: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required>
                                            {depts.map(d => <option key={d._id || d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Program</label>
                                        <select value={editData.program} onChange={e => setEditData({ ...editData, program: e.target.value })} className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm" required>
                                            {programs.map(p => <option key={p._id} value={p.code}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Courses</label>
                                        <select 
                                            value="" 
                                            onChange={e => {
                                                if (e.target.value && !editData.enrolled_courses?.includes(e.target.value)) {
                                                    setEditData({ ...editData, enrolled_courses: [...(editData.enrolled_courses || []), e.target.value] });
                                                }
                                            }} 
                                            className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm"
                                        >
                                            <option value="">Add Course</option>
                                            {getFilteredCourses(editData.department_id, editData.program).map(c => <option key={c._id} value={c.code}>{c.name}</option>)}
                                        </select>
                                        {editData.enrolled_courses?.length > 0 && (
                                            <div className="mt-2 flex gap-1 flex-wrap">
                                                {editData.enrolled_courses.map(code => (
                                                    <span key={code} className="bg-blue-500/20 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                        {code}
                                                        <button type="button" onClick={() => setEditData({ ...editData, enrolled_courses: editData.enrolled_courses.filter(c => c !== code) })} className="text-red-400 hover:text-red-300">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" onClick={e => e.stopPropagation()} className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm font-medium transition-colors">Save</button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); cancelEdit(e); }} className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm font-medium transition-colors">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => startEdit(e, student)} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" title="Edit">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={(e) => handleDelete(e, student._id || student.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Delete">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-start mb-2 pr-8">
                                        <span className="font-mono text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{student.id}</span>
                                        <span className="text-xs text-gray-500">{student.department_id}</span>
                                    </div>
                                    <h4 className="font-semibold text-white">{student.name}</h4>
                                    <div className="mt-2 text-xs text-gray-500">
                                        <div>Program: {student.program}</div>
                                        {student.enrolled_courses?.length > 0 && (
                                            <div className="mt-1">Courses: {student.enrolled_courses.join(', ')}</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {students.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No students found.</div>}
                </div>
            )}
        </div>
    );
};

export default StudentsManager;
