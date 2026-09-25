//frontend/src/components/SprintStatusButton.tsx
import { Play, CheckCircle2, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './SprintStatusButton.css';

type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface SprintStatusButtonProps {
    status: SprintStatus;
    onStatusChange: (status: SprintStatus) => void | Promise<void>;
    loading?: boolean;
    size?: 'normal' | 'small';
}

interface ActionConfig {
    label: string;
    icon: LucideIcon;
    nextStatus: SprintStatus;
    variant: 'primary' | 'secondary';
}

function getAction(status: SprintStatus): ActionConfig | null {
    switch (status) {
        case 'PLANNED':
            return {
                label: 'Начать спринт',
                icon: Play,
                nextStatus: 'ACTIVE',
                variant: 'primary',
            };
        case 'ACTIVE':
            return {
                label: 'Завершить спринт',
                icon: CheckCircle2,
                nextStatus: 'COMPLETED',
                variant: 'primary',
            };
        case 'COMPLETED':
            return {
                label: 'Возобновить',
                icon: RotateCcw,
                nextStatus: 'ACTIVE',
                variant: 'secondary',
            };
        case 'CANCELLED':
            return {
                label: 'Возобновить',
                icon: RotateCcw,
                nextStatus: 'ACTIVE',
                variant: 'secondary',
            };
        default:
            return null;
    }
}

export default function SprintStatusButton({
    status,
    onStatusChange,
    loading,
    size = 'normal',
}: SprintStatusButtonProps) {
    const action = getAction(status);
    if (!action) return null;

    const Icon = action.icon;

    return (
        <button
            type="button"
            className={`sprint-status-btn sprint-status-btn-${size} sprint-status-btn-${action.variant}`}
            onClick={() => onStatusChange(action.nextStatus)}
            disabled={loading}
        >
            <Icon size={size === 'small' ? 14 : 16} />
            {loading ? '...' : action.label}
        </button>
    );
}