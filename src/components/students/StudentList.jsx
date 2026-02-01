import { useState, useEffect } from 'react';
import { getStudents, toggleBlockStudent } from '../../services/studentService';
import toast from 'react-hot-toast';
import { Users, Mail, Phone, Shield, ShieldOff, AlertCircle } from 'lucide-react';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggleLoading, setToggleLoading] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const studentsList = await getStudents();
            setStudents(studentsList);
        } catch (error) {
            toast.error('Failed to fetch students');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (uid, currentStatus, name) => {
        const action = currentStatus ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) {
            return;
        }

        setToggleLoading(uid);
        try {
            await toggleBlockStudent(uid, currentStatus);
            toast.success(`Student ${action}ed successfully`);
            // Update local state
            setStudents(prev =>
                prev.map(student =>
                    student.id === uid
                        ? { ...student, is_blocked: !currentStatus }
                        : student
                )
            );
        } catch (error) {
            toast.error(`Failed to ${action} student`);
            console.error(error);
        } finally {
            setToggleLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Student Management</h2>
                        <p className="opacity-90">View and manage student accounts</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <p className="text-gray-600 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800">{students.length}</p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Active Students</p>
                    <p className="text-3xl font-bold text-green-600">
                        {students.filter(s => !s.is_blocked).length}
                    </p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Blocked Students</p>
                    <p className="text-3xl font-bold text-red-600">
                        {students.filter(s => s.is_blocked).length}
                    </p>
                </div>
            </div>

            {/* Student List */}
            <div className="card">
                {students.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No students registered yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-green-700 font-semibold">
                                                        {student.name?.charAt(0).toUpperCase() || 'S'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-900">{student.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{student.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{student.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {student.is_blocked ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                    <ShieldOff className="w-4 h-4" />
                                                    Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                    <Shield className="w-4 h-4" />
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleToggleBlock(student.id, student.is_blocked, student.name)}
                                                disabled={toggleLoading === student.id}
                                                className={`px-4 py-2 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${student.is_blocked
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                            >
                                                {toggleLoading === student.id
                                                    ? 'Processing...'
                                                    : student.is_blocked
                                                        ? 'Unblock'
                                                        : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentList;
