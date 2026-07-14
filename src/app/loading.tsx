"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent shadow-md"></div>
        {/* Pulse inner circle */}
        <div className="absolute h-8 w-8 animate-ping rounded-full bg-primary/20"></div>
      </div>
      <p className="mt-4 text-sm font-semibold tracking-wider text-black dark:text-white animate-pulse">
        Cargando sistema...
      </p>
    </div>
  );
}
