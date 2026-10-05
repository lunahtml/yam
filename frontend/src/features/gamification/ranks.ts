//frontend/src/features/gamification/ranks.ts

export interface Rank {
    key: string;
    label: string;
    icon: string;
    minXp: number;
    color: string;
}

export const RANKS: Rank[] = [
    { key: 'rookie', label: 'Новичок', icon: '🥚', minXp: 0, color: '#8b7ba8' },
    { key: 'apprentice', label: 'Ученик', icon: '🐣', minXp: 100, color: '#22d3ee' },
    { key: 'journeyman', label: 'Подмастерье', icon: '🌱', minXp: 500, color: '#a3e635' },
    { key: 'expert', label: 'Эксперт', icon: '🔥', minXp: 1500, color: '#a855f7' },
    { key: 'master', label: 'Мастер', icon: '💎', minXp: 3000, color: '#22c55e' },
    { key: 'legend', label: 'Легенда', icon: '👑', minXp: 10000, color: '#f59e0b' },
];

export interface RankInfo {
    current: Rank;
    next: Rank | null;
    progress: number;
    xpToNext: number;
}

export function getRankInfo(totalXp: number): RankInfo {
    let current = RANKS[0];
    let next: Rank | null = null;

    for (let i = 0; i < RANKS.length; i++) {
        if (totalXp >= RANKS[i].minXp) {
            current = RANKS[i];
            next = RANKS[i + 1] ?? null;
        } else {
            break;
        }
    }

    let progress = 100;
    let xpToNext = 0;

    if (next) {
        const range = next.minXp - current.minXp;
        const done = totalXp - current.minXp;
        progress = range === 0 ? 100 : Math.round((done / range) * 100);
        xpToNext = next.minXp - totalXp;
    }

    return { current, next, progress, xpToNext };
}