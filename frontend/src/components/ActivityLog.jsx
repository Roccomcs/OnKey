// frontend/src/components/ActivityLog.jsx
// Componente para mostrar el log de actividades

import { useEffect } from 'react';
import { fmtDate, fmtDateRelative } from '../utils/helpers';
import { 
  Home, Plus, FileText, DollarSign, Users, AlertTriangle, RefreshCw, Trash2
} from 'lucide-react';

// Mapeo de tipos de actividad a iconos y colores
const activityConfig = {
  property_created: {
    icon: Plus,
    label: 'Propiedad agregada',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    color: 'blue'
  },
  property_updated: {
    icon: Home,
    label: 'Propiedad actualizada',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    color: 'blue'
  },
  property_deleted: {
    icon: Trash2,
    label: 'Propiedad eliminada',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    color: 'red'
  },
  lease_created: {
    icon: FileText,
    label: 'Contrato creado',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    color: 'emerald'
  },
  lease_renewed: {
    icon: RefreshCw,
    label: 'Contrato renovado',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    color: 'purple'
  },
  lease_ended: {
    icon: AlertTriangle,
    label: 'Contrato vencido',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    color: 'orange'
  },
  lease_rescinded: {
    icon: Trash2,
    label: 'Contrato rescindido',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    color: 'red'
  },
  tenant_created: {
    icon: Plus,
    label: 'Inquilino agregado',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    color: 'indigo'
  },
  tenant_updated: {
    icon: Users,
    label: 'Inquilino actualizado',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    color: 'indigo'
  },
  owner_created: {
    icon: Plus,
    label: 'Propietario agregado',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    color: 'cyan'
  },
  owner_updated: {
    icon: Users,
    label: 'Propietario actualizado',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    color: 'cyan'
  },
  alert_triggered: {
    icon: AlertTriangle,
    label: 'Nueva alerta',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    color: 'red'
  }
};

function ActivityItem({ activity }) {
  const cfg = activityConfig[activity.type] || {
    icon: FileText,
    label: activity.type,
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    color: 'gray'
  };

  const Icon = cfg.icon;
  const timeAgo = fmtDateRelative(new Date(activity.createdAt));

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-[#27272a] last:border-b-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon size={16} className={cfg.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-[#e4e4e7] leading-tight">
          {activity.title}
        </p>
        {activity.description && (
          <p className="text-xs text-gray-500 dark:text-[#71717a] mt-0.5 truncate">
            {activity.description}
          </p>
        )}
        <p className="text-[11px] text-gray-400 dark:text-[#52525b] mt-1">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

export function ActivityLog({ activities, loading = false, onRefresh }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-[#52525b] text-center py-4">
        Sin actividad reciente
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
