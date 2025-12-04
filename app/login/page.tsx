'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email o contraseña incorrectos');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] py-12 px-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 left-20 w-72 h-72 bg-[#8b4513] rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#daa520] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-200 dark:border-gray-800 animate-scale-in hover-glow">
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 gradient-primary rounded-2xl shadow-lg">
                            <LogIn className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-center mb-3 gradient-primary bg-clip-text text-transparent">
                        Bienvenido de Nuevo
                    </h1>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                        Inicia sesión para continuar
                    </p>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-5 py-4 rounded-xl mb-6 animate-shake">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#8b4513]/20 focus:border-[#8b4513] dark:bg-[#222] dark:text-white transition-all duration-300 font-medium"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-[#8b4513]/20 focus:border-[#8b4513] dark:bg-[#222] dark:text-white transition-all duration-300 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 button-primary"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-center text-gray-600 dark:text-gray-400">
                            ¿No tienes cuenta?{' '}
                            <Link
                                href="/register"
                                className="text-[#8b4513] hover:text-[#6d3610] dark:text-[#daa520] dark:hover:text-[#c79420] font-bold transition-colors inline-flex items-center gap-1 hover:gap-2"
                            >
                                Regístrate aquí
                                <Sparkles className="w-4 h-4" />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
