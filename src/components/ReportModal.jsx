import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { X, Calendar, Clock, MapPin, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ReportModal = ({ employee, onClose }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchAttendance = async (date) => {
        setLoading(true);
        setError('');
        setAttendance(null);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const res = await fetch(`https://the-aacharya.onrender.com/api/login-logs/${employee.empID}/logs/${formattedDate}`);
            if (!res.ok) {
                if(res.status === 404) {
                    setAttendance([]); 
                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to fetch attendance data');
                }
            } else {
                const data = await res.json();
                setAttendance(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employee) {
            fetchAttendance(selectedDate);
        }
    }, [selectedDate, employee]);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Attendance Report</h2>
                            <p className="text-gray-600 mt-1">{employee.name} {employee.surname} (ID: {employee.empID})</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                            <X size={24} />
                        </button>
                    </header>

                    <div className="p-6">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <label htmlFor="date-picker" className="flex items-center text-md font-medium text-gray-700 whitespace-nowrap">
                                <Calendar size={18} className="mr-2" />
                                Select Date:
                            </label>
                            <DatePicker
                                id="date-picker"
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="MMMM d, yyyy"
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxDate={new Date()}
                                minDate={fifteenDaysAgo}
                            />
                        </div>

                        <div className="mt-4 min-h-[200px]">
                            {loading && (
                                <div className="flex items-center justify-center p-8">
                                    <Loader className="animate-spin text-blue-500" size={32} />
                                    <p className="ml-3 text-gray-600">Loading attendance data...</p>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
                                    <AlertCircle className="text-red-500" size={24} />
                                    <p className="ml-3 text-red-700">{error}</p>
                                </div>
                            )}
                            {!loading && !error && attendance && (
                                <div>
                                    {attendance.length > 0 ? (
                                        <ul className="space-y-4">
                                            {attendance.map((record, index) => (
                                                <li key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Login Info */}
                                                        <div className="pr-4 md:border-r md:border-gray-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                                                    Login
                                                                </span>
                                                                <span className="flex items-center text-gray-600 text-sm">
                                                                    <Clock size={16} className="mr-1.5" />
                                                                    {record.login_time ? format(new Date(record.login_time), 'p') : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-gray-600 text-sm">
                                                                <MapPin size={16} className="mr-1.5" />
                                                                {record.login_location ? (
                                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${record.login_location}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                                        View Location
                                                                    </a>
                                                                ) : 'Not available'}
                                                            </div>
                                                        </div>

                                                        {/* Logout Info */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                    Logout
                                                                </span>
                                                                <span className="flex items-center text-gray-600 text-sm">
                                                                    <Clock size={16} className="mr-1.5" />
                                                                    {record.logout_time ? format(new Date(record.logout_time), 'p') : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-gray-600 text-sm">
                                                                <MapPin size={16} className="mr-1.5" />
                                                                {record.logout_location ? (
                                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${record.logout_location}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                                        View Location
                                                                    </a>
                                                                ) : 'Not available'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600 font-medium">No attendance records found for this day.</p>
                                            <p className="text-gray-500 text-sm mt-1">The employee may have been on leave or not worked on this date.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReportModal; 