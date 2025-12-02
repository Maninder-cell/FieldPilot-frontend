'use client';

import React from 'react';
import { Crown, Shield, Users, User, Wrench, UserCircle } from 'lucide-react';
import { MemberRole } from '@/types/onboarding';

interface RoleBadgeProps {
  role: MemberRole;
  size?: 'sm' | 'md' | 'lg';
}

const ROLE_CONFIG: Record<MemberRole, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  owner: {
    label: 'Owner',
    icon: Crown,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
  },
  manager: {
    label: 'Manager',
    icon: Users,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  employee: {
    label: 'Employee',
    icon: User,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
  },
  technician: {
    label: 'Technician',
    icon: Wrench,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  customer: {
    label: 'Customer',
    icon: UserCircle,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
};

const SIZE_CONFIG = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    icon: 'w-5 h-5',
  },
};

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeConfig.padding} ${sizeConfig.text}
      `}
    >
      <Icon className={sizeConfig.icon} />
      <span>{config.label}</span>
    </span>
  );
}
