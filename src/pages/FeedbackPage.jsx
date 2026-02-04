import { useState, useEffect } from 'react';
import { getFeedbacks, updateFeedbackStatus, deleteFeedback, replyToFeedback } from '../services/feedbackService';
import toast from 'react-hot-toast';
import { MessageSquare, User, Calendar, CheckCircle, Clock, Trash2, Star, Reply, Send, X } from 'lucide-react';

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const data = await getFeedbacks();
            setFeedbacks(data);
        } catch (error) {
            toast.error('Failed to fetch feedbacks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, currentStatus) => {
        const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
        setActionLoading(id);
        try {
            await updateFeedbackStatus(id, newStatus);
            toast.success(`Feedback marked as ${newStatus}`);
            setFeedbacks(prev =>
                prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
            );
        } catch (error) {
            toast.error('Failed to update status');
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setActionLoading(id);
        try {
            const updatedFeedback = await replyToFeedback(id, replyText);
            toast.success('Reply sent successfully');
            setFeedbacks(prev =>
                prev.map(f => f.id === id ? {
                    ...f,
                    admin_response: replyText,
                    status: 'resolved',
                    responded_at: updatedFeedback.responded_at
                } : f)
            );
            setReplyingTo(null);
            setReplyText('');
        } catch (error) {
            toast.error('Failed to send reply');
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        setActionLoading(id);
        try {
            await deleteFeedback(id);
            toast.success('Feedback deleted successfully');
            setFeedbacks(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            toast.error('Failed to delete feedback');
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Feedback Portal</h2>
                        <p className="opacity-90">Manage feedback from students and drivers</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="text-3xl font-bold text-gray-800">{feedbacks.length}</p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-orange-500">
                        {feedbacks.filter(f => f.status === 'pending').length}
                    </p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">
                        {feedbacks.filter(f => f.status === 'resolved').length}
                    </p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">From Drivers</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {feedbacks.filter(f => f.student?.role === 'driver').length}
                    </p>
                </div>
            </div>

            {/* Feedback List */}
            <div className="grid grid-cols-1 gap-4">
                {feedbacks.length === 0 ? (
                    <div className="card text-center py-12">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No feedback received yet</p>
                    </div>
                ) : (
                    feedbacks.map((feedback) => (
                        <div key={feedback.id} className={`card border-l-4 ${feedback.status === 'resolved' ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${feedback.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {feedback.status}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${feedback.student?.role === 'driver' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {feedback.student?.role || 'student'}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-800">{feedback.subject}</h3>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed italic">"{feedback.message}"</p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>{feedback.student?.name || 'Unknown'} {feedback.student?.roll_number ? `(${feedback.student.roll_number})` : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {feedback.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span>{feedback.rating}/5</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Response Section */}
                                    {feedback.admin_response ? (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-sm">
                                                <Reply className="w-4 h-4" />
                                                <span>Admin Response</span>
                                                <span className="text-gray-400 font-normal text-xs ml-auto">
                                                    {feedback.responded_at ? new Date(feedback.responded_at).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{feedback.admin_response}</p>
                                        </div>
                                    ) : (
                                        replyingTo === feedback.id && (
                                            <div className="mt-4 space-y-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-semibold text-indigo-800">Your Response</label>
                                                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="w-full p-3 rounded-md border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                                                    placeholder="Type your reply here..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(feedback.id)}
                                                        disabled={actionLoading === feedback.id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        {actionLoading === feedback.id ? 'Sending...' : 'Send Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 justify-end">
                                    {!feedback.admin_response && replyingTo !== feedback.id && (
                                        <button
                                            onClick={() => setReplyingTo(feedback.id)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                        >
                                            <Reply className="w-4 h-4" />
                                            Reply
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStatusUpdate(feedback.id, feedback.status)}
                                        disabled={actionLoading === feedback.id}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${feedback.status === 'resolved'
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {feedback.status === 'resolved' ? (
                                            <><Clock className="w-4 h-4" /> Reopen</>
                                        ) : (
                                            <><CheckCircle className="w-4 h-4" /> Resolve</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(feedback.id)}
                                        disabled={actionLoading === feedback.id}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedbackPage;
