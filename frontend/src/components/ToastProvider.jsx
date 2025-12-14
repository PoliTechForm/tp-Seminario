import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast() {
    return useContext(ToastContext)
}

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
        const t = { id, message, type }
        setToasts((s) => [...s, t])
        setTimeout(() => {
            setToasts((s) => s.filter(x => x.id !== id))
        }, duration)
    }, [])

    const value = { showToast }

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                {toasts.map(t => (
                    <div key={t.id} className={`max-w-xs px-4 py-2 rounded shadow-lg text-sm text-white ${t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
