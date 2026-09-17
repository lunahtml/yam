//frontend/src/components/InfoPopup.tsx
import { ReactNode, useEffect, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import './InfoPopup.css';

interface InfoPopupProps {
    title: string;
    children: ReactNode;
}

export default function InfoPopup({ title, children }: InfoPopupProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) {
            document.addEventListener('keydown', handler);
            return () => document.removeEventListener('keydown', handler);
        }
    }, [open]);

    return (
        <>
            <button
                type="button"
                className="info-popup-trigger"
                onClick={() => setOpen(true)}
                title="Что это?"
            >
                <HelpCircle size={16} />
            </button>

            {open && (
                <div className="info-popup-overlay" onClick={() => setOpen(false)}>
                    <div className="info-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="info-popup-header">
                            <h3 className="info-popup-title">{title}</h3>
                            <button
                                className="info-popup-close"
                                onClick={() => setOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="info-popup-content">{children}</div>
                    </div>
                </div>
            )}
        </>
    );
}