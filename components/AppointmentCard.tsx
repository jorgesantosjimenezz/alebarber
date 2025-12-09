'use client';

import { format, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { Calendar, Clock, Trash2, Pencil, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const TIMEZONE = 'Europe/Vilnius';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface AppointmentCardProps {
    appointment: {
        id: string;
        startTime: Date;
        endTime: Date;
    };
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

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

    const handleOpenEditModal = () => {
        setShowEditModal(true);
        setSelectedDate(null);
        setAvailableSlots([]);
        setSelectedSlot(null);
        setError('');
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedDate(null);
        setAvailableSlots([]);
        setSelectedSlot(null);
        setError('');
    };

    const handleDateChange = async (value: Value) => {
        if (!value || Array.isArray(value)) return;

        setSelectedDate(value);
        setSelectedSlot(null);
        setError('');
        setLoadingSlots(true);

        try {
            const dateStr = format(value, 'yyyy-MM-dd');
            const response = await fetch(`/api/availability?date=${dateStr}`);
            const data = await response.json();

            if (response.ok) {
                const slots = data.slots.map((slot: string) => new Date(slot));
                setAvailableSlots(slots);

                if (slots.length === 0) {
                    setError('No hay horarios disponibles para esta fecha');
                }
            } else {
                setError(data.error || 'Error al cargar horarios');
                setAvailableSlots([]);
            }
        } catch (error) {
            setError('Error al cargar horarios');
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleUpdateAppointment = async () => {
        if (!selectedSlot) return;

        setUpdating(true);
        setError('');

        try {
            const response = await fetch(`/api/appointments/${appointment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startTime: selectedSlot.toISOString(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                handleCloseEditModal();
                router.refresh();
            } else {
                setError(data.error || 'Error al actualizar la cita');
            }
        } catch (error) {
            setError('Error al actualizar la cita');
        } finally {
            setUpdating(false);
        }
    };

    const tileDisabled = ({ date }: { date: Date }) => {
        const today = startOfDay(new Date());
        const maxDate = new Date(2026, 5, 30);
        return date < today || date > maxDate;
    };

    const tileClassName = ({ date }: { date: Date }) => {
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 2 || dayOfWeek === 4) {
            return 'closed-day';
        }
        return '';
    };

    return (
        <>
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
                    <div className="flex gap-2">
                        <button
                            onClick={handleOpenEditModal}
                            className="bg-[#8b4513] hover:bg-[#6d3610] text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                            <Pencil className="w-4 h-4" />
                            Editar
                        </button>
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
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-[#8b4513]">Cambiar Fecha de Cita</h2>
                            <button
                                onClick={handleCloseEditModal}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Current Appointment Info */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-[#222] rounded-xl">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Cita Actual:</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {format(vilniusStartTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} a las {format(vilniusStartTime, 'HH:mm')}
                                </p>
                            </div>

                            {/* Calendar */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#8b4513] mb-3">Selecciona Nueva Fecha:</h3>
                                <div className="calendar-wrapper-modal">
                                    <ReactCalendar
                                        onChange={handleDateChange}
                                        value={selectedDate}
                                        minDate={new Date()}
                                        maxDate={new Date(2026, 5, 30)}
                                        tileDisabled={tileDisabled}
                                        tileClassName={tileClassName}
                                        locale="es-ES"
                                        className="custom-calendar-modal"
                                    />
                                </div>
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-[#8b4513] mb-3">Horarios Disponibles:</h3>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#8b4513]" />
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots.map((slot) => {
                                                const vilniusTime = toZonedTime(slot, TIMEZONE);
                                                const timeStr = format(vilniusTime, 'HH:mm');
                                                const isSelected = selectedSlot && isSameDay(selectedSlot, slot) &&
                                                    selectedSlot.getTime() === slot.getTime();

                                                return (
                                                    <button
                                                        key={slot.toISOString()}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`py-3 px-3 rounded-lg font-semibold transition-all ${isSelected
                                                            ? 'bg-[#8b4513] text-white ring-2 ring-[#daa520]'
                                                            : 'bg-gray-100 dark:bg-[#333] hover:bg-[#8b4513] hover:text-white'
                                                            }`}
                                                    >
                                                        {timeStr}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center py-4 text-gray-500">
                                            {error || 'No hay horarios disponibles'}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseEditModal}
                                    className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateAppointment}
                                    disabled={!selectedSlot || updating}
                                    className="flex-1 py-3 px-4 bg-[#8b4513] text-white rounded-lg font-semibold hover:bg-[#6d3610] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Actualizando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Confirmar Cambio
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Calendar Styles */}
            <style jsx global>{`
                .calendar-wrapper-modal {
                    width: 100%;
                }

                .custom-calendar-modal {
                    width: 100%;
                    border: none !important;
                    background: transparent !important;
                    font-family: inherit !important;
                }

                .custom-calendar-modal .react-calendar__navigation {
                    margin-bottom: 0.75rem !important;
                    background: linear-gradient(135deg, #8b4513 0%, #6d3610 100%) !important;
                    border-radius: 0.5rem !important;
                    padding: 0.25rem !important;
                }

                .custom-calendar-modal .react-calendar__navigation button {
                    color: white !important;
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    min-width: 28px !important;
                }

                .custom-calendar-modal .react-calendar__navigation button:enabled:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-radius: 0.25rem !important;
                }

                .custom-calendar-modal .react-calendar__navigation__prev2-button,
                .custom-calendar-modal .react-calendar__navigation__next2-button {
                    display: none !important;
                }

                .custom-calendar-modal .react-calendar__month-view__weekdays {
                    text-transform: uppercase !important;
                    font-size: 0.6rem !important;
                    font-weight: 600 !important;
                    color: #8b4513 !important;
                }

                .custom-calendar-modal .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none !important;
                }

                .custom-calendar-modal .react-calendar__tile {
                    padding: 0.5rem 0.25rem !important;
                    border-radius: 0.25rem !important;
                    font-size: 0.75rem !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }

                .custom-calendar-modal .react-calendar__tile:enabled:hover {
                    background: #8b4513 !important;
                    color: white !important;
                }

                .custom-calendar-modal .react-calendar__tile--active {
                    background: linear-gradient(135deg, #daa520 0%, #c79420 100%) !important;
                    color: #1a1a1a !important;
                    font-weight: 600 !important;
                }

                .custom-calendar-modal .react-calendar__tile--now {
                    background: rgba(139, 69, 19, 0.1) !important;
                    border: 1px solid #8b4513 !important;
                }

                .custom-calendar-modal .react-calendar__tile:disabled {
                    opacity: 0.35 !important;
                }

                .custom-calendar-modal .closed-day {
                    color: #dc2626 !important;
                }

                .custom-calendar-modal .closed-day:enabled:hover {
                    background: #dc2626 !important;
                    color: white !important;
                }

                .custom-calendar-modal .react-calendar__month-view__days__day--weekend {
                    color: inherit !important;
                }
            `}</style>
        </>
    );
}
