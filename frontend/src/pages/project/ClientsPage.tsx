//frontend/src/pages/project/ClientsPage.tsx
import { Users } from 'lucide-react';
import './ClientsPage.css';

export default function ClientsPage() {
    return (
        <div className="clients-page">
            <h1 className="clients-title">
                <span className="clients-title-icon">
                    <Users size={22} color="#fff" strokeWidth={2.5} />
                </span>
                Клиенты
            </h1>

            <div className="clients-empty">
                <p>База клиентов — в разработке.</p>
                <p className="clients-hint">
                    Заводим вручную только тех, кто дал согласие на обработку данных.
                </p>
            </div>
        </div>
    );
}