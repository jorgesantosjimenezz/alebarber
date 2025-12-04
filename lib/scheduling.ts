import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { addMinutes, startOfDay, setHours, setMinutes, isSameDay } from 'date-fns';
import { prisma } from './prisma';

// Time zone constant for Vilnius
const TIMEZONE = 'Europe/Vilnius';

// Service duration in minutes
const SERVICE_DURATION = 45;

// Business hours configuration
type BusinessHours = {
    open: number;  // hour (24-hour format)
    close: number; // hour (24-hour format)
} | null;

/**
 * Get business hours for a specific date
 * Returns null if the business is closed
 */
export function getBusinessHours(date: Date): BusinessHours {
    const vilniusDate = toZonedTime(date, TIMEZONE);
    const dayOfWeek = vilniusDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Tuesday (2) and Thursday (4) are closed
    if (dayOfWeek === 2 || dayOfWeek === 4) {
        return null;
    }

    // Saturday (6) and Sunday (0): 1:00 PM - 4:00 PM
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { open: 13, close: 16 };
    }

    // Monday (1), Wednesday (3), Friday (5): 12:00 PM - 4:00 PM
    return { open: 12, close: 16 };
}

/**
 * Generate all possible time slots for a given date
 * Returns slots in Vilnius time zone
 */
export function generateTimeSlots(date: Date): Date[] {
    const hours = getBusinessHours(date);

    if (!hours) {
        return []; // Business is closed
    }

    const slots: Date[] = [];
    const vilniusDate = toZonedTime(date, TIMEZONE);
    const startOfDayVilnius = startOfDay(vilniusDate);

    // Start time in Vilnius
    let currentSlot = setMinutes(setHours(startOfDayVilnius, hours.open), 0);
    const closingTime = setMinutes(setHours(startOfDayVilnius, hours.close), 0);

    while (currentSlot < closingTime) {
        const slotEnd = addMinutes(currentSlot, SERVICE_DURATION);

        // Only add slot if it ends before or at closing time
        if (slotEnd <= closingTime) {
            // Convert back to UTC for storage
            const utcSlot = fromZonedTime(currentSlot, TIMEZONE);
            slots.push(utcSlot);
        }

        currentSlot = addMinutes(currentSlot, SERVICE_DURATION);
    }

    return slots;
}

/**
 * Get available slots for a given date (excluding booked appointments)
 */
export async function getAvailableSlots(date: Date): Promise<Date[]> {
    const allSlots = generateTimeSlots(date);

    if (allSlots.length === 0) {
        return [];
    }

    // Get all confirmed appointments for this date
    const vilniusDate = toZonedTime(date, TIMEZONE);
    const startOfDayVilnius = startOfDay(vilniusDate);
    const startOfDayUTC = fromZonedTime(startOfDayVilnius, TIMEZONE);
    const endOfDayUTC = fromZonedTime(addMinutes(startOfDayVilnius, 24 * 60 - 1), TIMEZONE);

    const bookedAppointments = await prisma.appointment.findMany({
        where: {
            status: 'CONFIRMED',
            startTime: {
                gte: startOfDayUTC,
                lte: endOfDayUTC,
            },
        },
        select: {
            startTime: true,
        },
    });

    // Filter out booked slots
    const bookedTimes = new Set(
        bookedAppointments.map((apt: { startTime: Date }) => apt.startTime.toISOString())
    );

    return allSlots.filter(slot => !bookedTimes.has(slot.toISOString()));
}

/**
 * Check if a specific time slot is available
 */
export async function isSlotAvailable(startTime: Date): Promise<boolean> {
    // First check if the time is within business hours
    const hours = getBusinessHours(startTime);
    if (!hours) {
        return false;
    }

    const vilniusTime = toZonedTime(startTime, TIMEZONE);
    const slotHour = vilniusTime.getHours();
    const slotMinute = vilniusTime.getMinutes();
    const slotTimeInMinutes = slotHour * 60 + slotMinute;
    const openTimeInMinutes = hours.open * 60;
    const closeTimeInMinutes = hours.close * 60;

    // Check if slot starts within business hours
    if (slotTimeInMinutes < openTimeInMinutes) {
        return false;
    }

    // Check if slot ends before closing time
    const endTimeInMinutes = slotTimeInMinutes + SERVICE_DURATION;
    if (endTimeInMinutes > closeTimeInMinutes) {
        return false;
    }

    // Check if slot is already booked
    const endTime = addMinutes(startTime, SERVICE_DURATION);

    const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
            status: 'CONFIRMED',
            OR: [
                {
                    // New appointment starts during an existing appointment
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } },
                    ],
                },
                {
                    // New appointment ends during an existing appointment
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } },
                    ],
                },
                {
                    // New appointment completely contains an existing appointment
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } },
                    ],
                },
            ],
        },
    });

    return !conflictingAppointment;
}

/**
 * Validate if an appointment can be booked
 */
export async function validateAppointment(startTime: Date): Promise<{
    valid: boolean;
    error?: string;
}> {
    const hours = getBusinessHours(startTime);

    if (!hours) {
        return { valid: false, error: 'El negocio está cerrado este día' };
    }

    const vilniusTime = toZonedTime(startTime, TIMEZONE);
    const slotHour = vilniusTime.getHours();
    const slotMinute = vilniusTime.getMinutes();
    const slotTimeInMinutes = slotHour * 60 + slotMinute;
    const openTimeInMinutes = hours.open * 60;
    const closeTimeInMinutes = hours.close * 60;

    if (slotTimeInMinutes < openTimeInMinutes) {
        return { valid: false, error: 'El horario seleccionado es antes del horario de apertura' };
    }

    const endTimeInMinutes = slotTimeInMinutes + SERVICE_DURATION;
    if (endTimeInMinutes > closeTimeInMinutes) {
        return { valid: false, error: 'El horario seleccionado excede el horario de cierre' };
    }

    const available = await isSlotAvailable(startTime);
    if (!available) {
        return { valid: false, error: 'Este horario ya está reservado' };
    }

    return { valid: true };
}

/**
 * Format a date in Vilnius timezone
 */
export function formatInVilniusTime(date: Date, formatStr: string): string {
    return format(toZonedTime(date, TIMEZONE), formatStr, { timeZone: TIMEZONE });
}

/**
 * Convert a local date/time to UTC for database storage
 */
export function toUTC(dateStr: string, timeStr: string): Date {
    // Parse the input as if it's in Vilnius timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    const vilniusDate = new Date(year, month - 1, day, hour, minute, 0);
    return fromZonedTime(vilniusDate, TIMEZONE);
}
