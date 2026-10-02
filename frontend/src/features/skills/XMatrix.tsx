//frontend/src/features/skills/XMatrix.tsx
import { useMemo, useState } from 'react';
import InfoPopup from '../../components/InfoPopup';
import { UserSkill, Category } from '../../types/api';
import './XMatrix.css';

interface XMatrixProps {
    userSkills: UserSkill[];
    spheres: Category[];
    geographies: Category[];
    title?: string;
    showFilters?: boolean;
}

type CellKey = `${string}__${string}`;

export default function XMatrix({
    userSkills,
    spheres,
    geographies,
    title = 'X-Matrix компетенций',
    showFilters = true,
}: XMatrixProps) {
    const [selectedGeography, setSelectedGeography] = useState<string>('all');

    // Фильтруем скиллы по выбранной географии
    const filteredSkills = useMemo(() => {
        if (selectedGeography === 'all') return userSkills;
        return userSkills.filter(
            (us) =>
                us.geographyId === selectedGeography ||
                (!us.geographyId && selectedGeography === 'all'),
        );
    }, [userSkills, selectedGeography]);

    // Уникальные skills (X) — по skillId
    const skills = useMemo(() => {
        const map = new Map<string, { id: string; label: string; type: string }>();
        for (const us of filteredSkills) {
            if (us.skill && !map.has(us.skill.id)) {
                map.set(us.skill.id, {
                    id: us.skill.id,
                    label: us.skill.label,
                    type: us.skill.type,
                });
            }
        }
        return Array.from(map.values());
    }, [filteredSkills]);

    // Матрица: skillId × sphereId → UserSkill
    const matrix = useMemo(() => {
        const m = new Map<CellKey, UserSkill>();
        for (const us of filteredSkills) {
            const key: CellKey = `${us.skillId}__${us.contextId ?? 'none'}`;
            // Если уже есть — берём с большим level
            const existing = m.get(key);
            if (!existing || us.level > existing.level) {
                m.set(key, us);
            }
        }
        return m;
    }, [filteredSkills]);

    // Скиллы без контекста (Y) — вынесем отдельно
    const noSphereSkills = useMemo(() => {
        return userSkills.filter((us) => !us.contextId);
    }, [userSkills]);

    const getLevelColor = (level: number): string => {
        if (level <= 2) return 'xmatrix-cell-infant';
        if (level <= 4) return 'xmatrix-cell-junior';
        if (level <= 6) return 'xmatrix-cell-middle';
        if (level <= 8) return 'xmatrix-cell-senior';
        return 'xmatrix-cell-guru';
    };

    if (userSkills.length === 0) {
        return (
            <div className="xmatrix-empty">
                <p>Пока нет данных для X-Matrix.</p>
                <p>Закрывай задачи с тегами, связанными со skills — навыки появятся здесь.</p>
            </div>
        );
    }

    return (
        <div className="xmatrix">
            <div className="xmatrix-header">
                <h3 className="xmatrix-title">
                    {title}
                    <InfoPopup title="Что такое X-Matrix?">
                        <p>
                            <strong>X-Matrix</strong> — это трёхмерная карта компетенций.
                            Она показывает не просто «навык 8/10», а <strong>в каком контексте</strong>{' '}
                            этот навык проявляется.
                        </p>
                        <p>
                            <strong>Три оси:</strong>
                        </p>
                        <ul>
                            <li>
                                <strong>X — навык</strong> (backend, маркетинг, юридические навыки).
                            </li>
                            <li>
                                <strong>Y — сфера</strong> (e-commerce, fintech, B2B).
                            </li>
                            <li>
                                <strong>Z — география</strong> (Россия, СНГ, зарубеж).
                            </li>
                        </ul>
                        <p>
                            Пример: «Backend — 8/10 в e-commerce в России, но 5/10 в fintech
                            в СНГ». Это честнее и справедливее, чем одна общая оценка.
                        </p>
                        <p>
                            <strong>Зачем это нужно:</strong> видеть, где человек реально
                            силён, справедливо оценивать вклад и рост, обосновывать оклад.
                        </p>
                    </InfoPopup>
                </h3>

                {showFilters && geographies.length > 0 && (
                    <div className="xmatrix-filters">
                        <label className="xmatrix-filter-label">География:</label>
                        <select
                            className="xmatrix-filter-select"
                            value={selectedGeography}
                            onChange={(e) => setSelectedGeography(e.target.value)}
                        >
                            <option value="all">Все</option>
                            {geographies.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {skills.length === 0 ? (
                <div className="xmatrix-empty">
                    <p>Нет навыков в выбранной географии.</p>
                </div>
            ) : (
                <div className="xmatrix-table-wrapper">
                    <table className="xmatrix-table">
                        <thead>
                            <tr>
                                <th className="xmatrix-th xmatrix-th-corner">
                                    Skill \ Сфера
                                </th>
                                {spheres.map((s) => (
                                    <th key={s.id} className="xmatrix-th">
                                        {s.name}
                                    </th>
                                ))}
                                <th className="xmatrix-th xmatrix-th-nocontext">
                                    Без сферы
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {skills.map((skill) => (
                                <tr key={skill.id}>
                                    <td className="xmatrix-td xmatrix-td-skill">
                                        <span className="xmatrix-skill-name">
                                            {skill.label}
                                        </span>
                                        {skill.type === 'SOFT' && (
                                            <span className="xmatrix-skill-type">Soft</span>
                                        )}
                                    </td>

                                    {spheres.map((sphere) => {
                                        const cell = matrix.get(
                                            `${skill.id}__${sphere.id}`,
                                        );
                                        return (
                                            <td
                                                key={sphere.id}
                                                className={`xmatrix-td ${cell ? getLevelColor(cell.level) : ''}`}
                                            >
                                                {cell ? (
                                                    <div className="xmatrix-cell">
                                                        <div className="xmatrix-cell-level">
                                                            {cell.level}
                                                        </div>
                                                        <div className="xmatrix-cell-label">
                                                            {cell.levelLabel}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="xmatrix-cell-empty">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}

                                    <td className="xmatrix-td xmatrix-td-nocontext">
                                        {(() => {
                                            const cell = matrix.get(
                                                `${skill.id}__none`,
                                            );
                                            if (!cell) {
                                                return (
                                                    <span className="xmatrix-cell-empty">
                                                        —
                                                    </span>
                                                );
                                            }
                                            return (
                                                <div
                                                    className={`xmatrix-cell-inline ${getLevelColor(cell.level)}`}
                                                >
                                                    {cell.level}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {noSphereSkills.length > 0 && (
                <div className="xmatrix-note">
                    <InfoPopup title="Навыки без сферы">
                        <p>
                            Навыки, которые не привязаны к конкретной сфере (Y).
                            Например, «менторство» — это глобальный навык,
                            он не зависит от ниши.
                        </p>
                    </InfoPopup>
                    Навыков без сферы: {noSphereSkills.length}
                </div>
            )}

            {selectedGeography !== 'all' && (
                <div className="xmatrix-note">
                    Показана география:{' '}
                    {geographies.find((g) => g.id === selectedGeography)?.name}
                </div>
            )}
        </div>
    );
}