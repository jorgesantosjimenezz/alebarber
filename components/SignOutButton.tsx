'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105"
        >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
    );
}
