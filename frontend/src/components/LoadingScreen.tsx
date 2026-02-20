"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

export default function LoadingScreen({ message = "LOADING", fullScreen = true }: LoadingScreenProps) {
    return (
        <div className={`flex flex-col items-center justify-center bg-[#0F0F0F] z-[999] overflow-hidden ${fullScreen ? 'fixed inset-0 h-screen w-full' : 'relative py-20 min-h-[400px]'}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full" />
                {/* Scanlines Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Logo Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    className="relative mb-12"
                >
                    {/* Pulsing Outer Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"
                    />

                    {/* Rotating Rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-6 border border-white/5 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-2 border-t-purple-500/50 border-r-blue-500/50 border-b-transparent border-l-transparent rounded-full"
                    />

                    {/* Logo Frame */}
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(168,85,247,0.2)",
                                "0 0 40px rgba(168,85,247,0.4)",
                                "0 0 20px rgba(168,85,247,0.2)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative"
                    >
                        <Image
                            src="/logos/new-logo.png"
                            alt="Void Logo"
                            width={80}
                            height={80}
                            className="object-contain relative z-10 brightness-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20 opacity-50" />
                    </motion.div>
                </motion.div>

                {/* Loading Content */}
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.5em" }}
                        className="flex items-center gap-1 mb-4"
                    >
                        <span className="text-sm font-black text-white/40 uppercase">System</span>
                        <span className="text-sm font-black text-purple-500 uppercase">{message}</span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-1.5 h-4 bg-purple-500"
                        />
                    </motion.div>

                    {/* Progress Bar Container */}
                    <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div
                            animate={{
                                left: ["-100%", "100%"],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                        />
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="mt-4 text-[10px] text-white/20 uppercase tracking-[0.3em]"
                    >
                        Establishing secure connection
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
