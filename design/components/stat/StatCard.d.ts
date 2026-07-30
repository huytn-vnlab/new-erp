import * as React from 'react';

/**
 * KPI stat block — big number, uppercase label, optional trend + accent icon,
 * with the signature top-right accent glow.
 * @startingPoint section="Data" subtitle="KPI stat card with trend + icon tile" viewport="700x170"
 */
export interface StatTrend { dir: 'up' | 'down'; value: string; }
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  trend?: StatTrend;
  /** Accent icon node (rendered in the top-right tile) */
  icon?: React.ReactNode;
  accent?: 'primary' | 'green' | 'amber' | 'red' | 'violet' | 'sky' | 'gray';
  className?: string;
  style?: React.CSSProperties;
}

export function StatCard(props: StatCardProps): JSX.Element;
