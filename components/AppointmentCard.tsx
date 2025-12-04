'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TIMEZONE = 'Europe/Vilnius';

interface AppointmentCardProps {
    appointment: {
        id: string;
        startTime: Date;
        endTime: Date;
        status: string;
    };
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const vilniusStartTime = toZonedTime(appointment.startTime, TIMEZONE);
    const vilniusEndTime = toZonedTime(appointment.endTime, TIMEZONE);

    const handleCancel = async () => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/appointments/${appointment.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al cancelar la cita');
            }
        } catch (error) {
            alert('Error al cancelar la cita');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-[#8b4513]" />
                        <span className="text-lg font-semibold">
                            {format(vilniusStartTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Clock className="w-5 h-5" />
                        <span>
                            {format(vilniusStartTime, 'HH:mm')} - {format(vilniusEndTime, 'HH:mm')}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Trash2 className="w-4 h-4" />
                    {loading ? 'Cancelando...' : 'Cancelar'}
                </button>
            </div>
        </div>
    );
}
