'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiUser, FiBook } from 'react-icons/fi';
import { API_BASE_URL } from '@/lib/api';

interface Schedule {
    _id: string;
    title: string;
    curriculum?: {
        title: string;
    };
    date: string;
    day: string;
    startTime: string;
    endTime: string;
    teacher?: {
        name: string;
    };
    location?: string;
}

interface AssignScheduleModalProps {
    isOpen: boolean;
    childName: string;
    childId: string;
    assignedScheduleIds: string[];
    onClose: () => void;
    onAssign: (scheduleIds: string[]) => Promise<void>;
    isSubmitting: boolean;
}

export default function AssignScheduleModal({
    isOpen,
    childName,
    childId,
    assignedScheduleIds,
    onClose,
    onAssign,
    isSubmitting
}: AssignScheduleModalProps) {
    const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
    const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchSchedules();
            setSelectedScheduleIds([...assignedScheduleIds]);
        }
    }, [isOpen, assignedScheduleIds]);

    const fetchSchedules = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/schedules`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setAvailableSchedules(data.schedules || []);
            } else {
                setError('Gagal memuat jadwal');
            }
        } catch (err) {
            setError('Gagal memuat jadwal');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSchedule = (scheduleId: string) => {
        setSelectedScheduleIds(prev => {
            if (prev.includes(scheduleId)) {
                return prev.filter(id => id !== scheduleId);
            } else {
                return [...prev, scheduleId];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAssign(selectedScheduleIds);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredSchedules = availableSchedules.filter(schedule =>
        schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.curriculum?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.day.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        <div className="bg-brand-purple px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    Kelola Jadwal - {childName}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <FiX className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                            {/* Search */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari jadwal..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                />
                            </div>

                            {/* Info */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Jadwal terpilih:</strong> {selectedScheduleIds.length} dari {availableSchedules.length}
                                </p>
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Memuat jadwal...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Schedule List */}
                            {!isLoading && !error && (
                                <div className="space-y-3">
                                    {filteredSchedules.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">
                                            {searchQuery ? 'Tidak ada jadwal yang sesuai' : 'Belum ada jadwal tersedia'}
                                        </p>
                                    ) : (
                                        filteredSchedules.map((schedule) => {
                                            const isSelected = selectedScheduleIds.includes(schedule._id);
                                            return (
                                                <div
                                                    key={schedule._id}
                                                    onClick={() => handleToggleSchedule(schedule._id)}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'border-brand-purple bg-purple-50'
                                                            : 'border-gray-200 hover:border-brand-purple hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}}
                                                                    className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded"
                                                                />
                                                                <h4 className="font-semibold text-gray-900">{schedule.title}</h4>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-2 ml-6">
                                                                {schedule.curriculum && (
                                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                        <FiBook className="h-4 w-4 text-brand-purple" />
                                                                        <span>{schedule.curriculum.title}</span>
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                    <FiCalendar className="h-4 w-4 text-brand-purple" />
                                                                    <span>{schedule.day} - {formatDate(schedule.date)}</span>
                                                                </div>
                                                                
                                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                    <FiClock className="h-4 w-4 text-brand-purple" />
                                                                    <span>{schedule.startTime} - {schedule.endTime}</span>
                                                                </div>
                                                                
                                                                {schedule.teacher && (
                                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                        <FiUser className="h-4 w-4 text-brand-purple" />
                                                                        <span>{schedule.teacher.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Jadwal</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
