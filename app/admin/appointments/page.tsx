'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Vilnius';

type SortOrder = 'nearest' | 'furthest';

interface Appointment {
    id: string;
    startTime: string;
    endTime: string;
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
    const [sortOrder, setSortOrder] = useState<SortOrder>('nearest');

    // Sort appointments based on selected order
    const sortedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => {
            const dateA = new Date(a.startTime).getTime();
            const dateB = new Date(b.startTime).getTime();
            return sortOrder === 'nearest' ? dateA - dateB : dateB - dateA;
        });
    }, [appointments, sortOrder]);

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
                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md p-4 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Citas</p>
                    <p className="text-2xl font-bold">{appointments.length}</p>
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordenar por:</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortOrder('nearest')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortOrder === 'nearest'
                                    ? 'bg-[#8b4513] text-white shadow-md'
                                    : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <ArrowUp className="w-4 h-4" />
                            Citas más próximas
                        </button>
                        <button
                            onClick={() => setSortOrder('furthest')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortOrder === 'furthest'
                                    ? 'bg-[#8b4513] text-white shadow-md'
                                    : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <ArrowDown className="w-4 h-4" />
                            Citas más lejanas
                        </button>
                    </div>
                </div>

                {/* Appointments Table */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#222]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Horario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Reservado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedAppointments.map((appointment) => {
                                    const vilniusStart = toZonedTime(new Date(appointment.startTime), TIMEZONE);
                                    const vilniusEnd = toZonedTime(new Date(appointment.endTime), TIMEZONE);

                                    return (
                                        <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#8b4513] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {appointment.user.name?.[0]?.toUpperCase() || appointment.user.email[0].toUpperCase()}
                                                    </div>
                                                    <div className="font-medium">{appointment.user.name || 'Sin nombre'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {appointment.user.email}
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {format(new Date(appointment.createdAt), "d MMM, HH:mm", { locale: es })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {appointments.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">
                                No hay citas agendadas todavía
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
