//frontend/src/pages/project/SeoPage.tsx
import { Search } from 'lucide-react';
import './SeoPage.css';

export default function SeoPage() {
    return (
        <div className="seo-page">
            <h1 className="seo-title">
                <span className="seo-title-icon">
                    <Search size={22} color="#fff" strokeWidth={2.5} />
                </span>
                SEO
            </h1>

            <div className="seo-empty">
                <p>SEO-модуль в разработке.</p>
                <p className="seo-hint">
                    Позиции, семантика, технический аудит, конкуренты, бэклинки.
                </p>
            </div>
        </div>
    );
}