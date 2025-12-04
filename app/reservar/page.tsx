'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Clock, Loader2, Info, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const TIMEZONE = 'Europe/Vilnius';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function ReservarPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');

    const handleDateChange = async (value: Value) => {
        if (!value || Array.isArray(value)) return;

        setSelectedDate(value);
        setSelectedSlot(null);
        setError('');
        setLoading(true);

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
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!selectedSlot) return;

        setBooking(true);
        setError('');

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startTime: selectedSlot.toISOString(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(data.error || 'Error al reservar la cita');
            }
        } catch (error) {
            setError('Error al reservar la cita');
        } finally {
            setBooking(false);
        }
    };

    const tileDisabled = ({ date }: { date: Date }) => {
        const today = startOfDay(new Date());
        const maxDate = new Date(2026, 5, 30); // Junio 30, 2026 (mes 5 = junio, 0-indexed)
        return date < today || date > maxDate;
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a]">
            <div className="container mx-auto max-w-6xl">
                {/* Header con fondo dorado */}
                <div className="gradient-primary text-white py-16 px-4 -mx-4 mb-12 animate-fade-in">
                    <div className="text-center">
                        <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl mb-4">
                            <CalendarIcon className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white drop-shadow-2xl">
                            Reservar Cita
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto drop-shadow-lg">
                            Selecciona tu fecha y horario preferido
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 px-4 pb-12">
                    {/* Calendar Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl p-8 hover-glow animate-scale-in">
                            <div className="flex items-center gap-3 mb-6">
                                <CalendarIcon className="w-6 h-6 text-[#8b4513]" />
                                <h2 className="text-2xl font-bold text-[#8b4513]">Selecciona una Fecha</h2>
                            </div>

                            {/* Custom styled calendar */}
                            <div className="calendar-wrapper">
                                <Calendar
                                    onChange={handleDateChange}
                                    value={selectedDate}
                                    minDate={new Date()}
                                    maxDate={new Date(2026, 5, 30)}
                                    tileDisabled={tileDisabled}
                                    locale="es-ES"
                                    className="custom-calendar"
                                />
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div className="mt-8 animate-fade-in">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clock className="w-6 h-6 text-[#8b4513]" />
                                        <h3 className="text-xl font-bold text-[#8b4513]">
                                            Horarios Disponibles
                                        </h3>
                                    </div>

                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-10 h-10 animate-spin text-[#8b4513]" />
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                            {availableSlots.map((slot) => {
                                                const vilniusTime = toZonedTime(slot, TIMEZONE);
                                                const timeStr = format(vilniusTime, 'HH:mm');
                                                const isSelected = selectedSlot && isSameDay(selectedSlot, slot) &&
                                                    selectedSlot.getTime() === slot.getTime();

                                                return (
                                                    <button
                                                        key={slot.toISOString()}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`py-4 px-4 rounded-xl font-bold transition-all duration-300 ${isSelected
                                                            ? 'gradient-primary text-white ring-4 ring-[#daa520] scale-105 shadow-xl'
                                                            : 'bg-gray-100 dark:bg-[#222] hover:bg-[#8b4513] hover:text-white hover:scale-105 shadow-md hover:shadow-lg'
                                                            }`}
                                                    >
                                                        {timeStr}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 dark:bg-[#222] rounded-xl">
                                            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                {error || 'No hay horarios disponibles'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && !loading && (
                                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl flex items-center gap-3 animate-shake">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            {/* Confirmation Button */}
                            {selectedSlot && (
                                <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700 animate-fade-in">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 mb-6 border-2 border-green-200 dark:border-green-800">
                                        <h3 className="font-bold mb-3 text-[#8b4513] text-lg flex items-center gap-2">
                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                            Resumen de tu Cita
                                        </h3>
                                        <div className="space-y-2 text-lg">
                                            <p className="flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5 text-gray-600" />
                                                <strong>Fecha:</strong> {format(toZonedTime(selectedSlot, TIMEZONE), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-gray-600" />
                                                <strong>Hora:</strong> {format(toZonedTime(selectedSlot, TIMEZONE), 'HH:mm')} (45 minutos)
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleBooking}
                                        disabled={booking}
                                        className="w-full gradient-primary text-white py-5 rounded-xl font-bold text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 button-primary"
                                    >
                                        {booking ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Reservando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-6 h-6" />
                                                Confirmar Reserva
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Information Panel */}
                    <div className="space-y-6">
                        {/* Important Information */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl p-8 hover-glow animate-slide-in-right">
                            <div className="flex items-center gap-3 mb-6">
                                <Info className="w-7 h-7 text-blue-600" />
                                <h3 className="font-bold text-2xl text-[#8b4513]">
                                    Información Importante
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Service Duration */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                                                Duración del Servicio
                                            </h4>
                                            <p className="text-blue-800 dark:text-blue-400 text-sm">
                                                Cada sesión dura exactamente 45 minutos
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cancellation Policy */}
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-1">
                                                Política de Cancelación
                                            </h4>
                                            <p className="text-amber-800 dark:text-amber-400 text-sm">
                                                Puedes cancelar tu cita desde el panel de control en cualquier momento
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Arrival Time */}
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">
                                                Hora de Llegada
                                            </h4>
                                            <p className="text-green-800 dark:text-green-400 text-sm">
                                                Por favor, llega 5 minutos antes de tu cita
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl p-8 hover-glow animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <CalendarIcon className="w-7 h-7 text-[#8b4513]" />
                                <h3 className="font-bold text-2xl text-[#8b4513]">
                                    Horario de Atención
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { days: 'Lun / Mié / Vie', hours: '12:00 - 16:00', open: true },
                                    { days: 'Sáb / Dom', hours: '13:00 - 16:00', open: true },
                                    { days: 'Mar / Jue', hours: 'Cerrado', open: false },
                                ].map((schedule, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${schedule.open
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-gray-700 opacity-60'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{schedule.days}</span>
                                            <span className={`font-semibold ${schedule.open
                                                ? 'text-green-700 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {schedule.hours}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Calendar Styles */}
            <style jsx global>{`
        .calendar-wrapper {
          width: 100%;
        }

        .custom-calendar {
          width: 100%;
          border: none !important;
          background: transparent !important;
          font-family: inherit !important;
        }

        .custom-calendar .react-calendar__navigation {
          margin-bottom: 1.5rem !important;
          background: linear-gradient(135deg, #8b4513 0%, #6d3610 100%) !important;
          border-radius: 1rem !important;
          padding: 1rem !important;
        }

        .custom-calendar .react-calendar__navigation button {
          color: white !important;
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          min-width: 44px !important;
        }

        .custom-calendar .react-calendar__navigation button:enabled:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 0.5rem !important;
        }

        /* Ocultar botones de navegación de 2 meses */
        .custom-calendar .react-calendar__navigation__prev2-button,
        .custom-calendar .react-calendar__navigation__next2-button {
          display: none !important;
        }

        .custom-calendar .react-calendar__month-view__weekdays {
          text-transform: uppercase !important;
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          color: #8b4513 !important;
          padding: 1rem 0 !important;
        }

        .custom-calendar .react-calendar__tile {
          padding: 1.25rem 0.5rem !important;
          border-radius: 0.75rem !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          margin: 0.25rem !important;
        }

        .custom-calendar .react-calendar__tile:enabled:hover {
          background: #8b4513 !important;
          color: white !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3) !important;
        }

        .custom-calendar .react-calendar__tile--active {
          background: linear-gradient(135deg, #daa520 0%, #c79420 100%) !important;
          color: #1a1a1a !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 16px rgba(218, 165, 32, 0.4) !important;
          transform: scale(1.05) !important;
        }

        .custom-calendar .react-calendar__tile--now {
          background: rgba(139, 69, 19, 0.1) !important;
          border: 2px solid #8b4513 !important;
        }

        .custom-calendar .react-calendar__tile:disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </main>
    );
}
