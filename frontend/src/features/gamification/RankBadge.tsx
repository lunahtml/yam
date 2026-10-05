//frontend/src/features/gamification/RankBadge.tsx
import { getRankInfo } from './ranks';
import './RankBadge.css';

interface RankBadgeProps {
    totalXp: number;
    size?: 'normal' | 'compact';
}

export default function RankBadge({ totalXp, size = 'normal' }: RankBadgeProps) {
    const { current, next, progress, xpToNext } = getRankInfo(totalXp);

    return (
        <div className={`rank-badge rank-badge-${size}`}>
            <div
                className="rank-badge-icon"
                style={{ borderColor: current.color }}
            >
                {current.icon}
            </div>

            <div className="rank-badge-content">
                <div className="rank-badge-label" style={{ color: current.color }}>
                    {current.label}
                </div>

                {next ? (
                    <>
                        <div className="rank-badge-progress-bar">
                            <div
                                className="rank-badge-progress-fill"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${current.color}, ${next.color})`,
                                }}
                            />
                        </div>
                        <div className="rank-badge-hint">
                            До «{next.label}» — {xpToNext} XP
                        </div>
                    </>
                ) : (
                    <div className="rank-badge-hint rank-badge-max">
                        Максимальный ранг достигнут
                    </div>
                )}
            </div>
        </div>
    );
}