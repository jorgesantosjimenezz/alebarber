'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Vilnius';

interface Appointment {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch('/api/admin/appointments');
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al cargar citas');
                return;
            }

            setAppointments(data.appointments);
        } catch (error) {
            setError('Error al cargar citas');
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter((apt) => {
        if (filter === 'all') return true;
        return apt.status.toLowerCase() === filter;
    });

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">Cargando citas...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </main>
        );
    }

    const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
    const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-[#8b4513] flex items-center gap-3">
                        <CalendarIcon className="w-10 h-10" />
                        Citas Agendadas
                    </h1>
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#8b4513] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver al Panel
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                        <p className="text-2xl font-bold">{appointments.length}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-4">
                        <p className="text-sm text-green-700 dark:text-green-300">Confirmadas</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{confirmedCount}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-4">
                        <p className="text-sm text-red-700 dark:text-red-300">Canceladas</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{cancelledCount}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-6 flex gap-3">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${filter === 'all'
                                ? 'bg-[#8b4513] text-white'
                                : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'
                            }`}
                    >
                        Todas ({appointments.length})
                    </button>
                    <button
                        onClick={() => setFilter('confirmed')}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${filter === 'confirmed'
                                ? 'bg-green-600 text-white'
                                : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'
                            }`}
                    >
                        Confirmadas ({confirmedCount})
                    </button>
                    <button
                        onClick={() => setFilter('cancelled')}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${filter === 'cancelled'
                                ? 'bg-red-600 text-white'
                                : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]'
                            }`}
                    >
                        Canceladas ({cancelledCount})
                    </button>
                </div>

                {/* Appointments Table */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#222]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Horario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Reservado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAppointments.map((appointment) => {
                                    const vilniusStart = toZonedTime(new Date(appointment.startTime), TIMEZONE);
                                    const vilniusEnd = toZonedTime(new Date(appointment.endTime), TIMEZONE);

                                    return (
                                        <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#8b4513] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {appointment.user.name?.[0]?.toUpperCase() || appointment.user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{appointment.user.name || 'Sin nombre'}</div>
                                                        <div className="text-sm text-gray-500">{appointment.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="font-medium">
                                                        {format(vilniusStart, "d 'de' MMMM, yyyy", { locale: es })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    <span className="font-mono">
                                                        {format(vilniusStart, 'HH:mm')} - {format(vilniusEnd, 'HH:mm')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {appointment.status === 'CONFIRMED' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        ✓ Confirmada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Cancelada
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {format(new Date(appointment.createdAt), "d MMM, HH:mm", { locale: es })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredAppointments.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">
                                No hay citas {filter !== 'all' ? filter === 'confirmed' ? 'confirmadas' : 'canceladas' : ''} todavía
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
