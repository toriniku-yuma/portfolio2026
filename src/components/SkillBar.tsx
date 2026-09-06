import type { CSSProperties } from 'react';
import type { Skill } from '../content/types';

export default function SkillBar({ skill }: { skill: Skill }) {
  return (
    <li className="min-w-0">
      <div className="flex items-baseline justify-between gap-4 text-sm mb-3">
        <span>{skill.name}</span>
        <span className="text-accent font-mono text-[12px]">{skill.level} / 100</span>
      </div>
      <div
        className="h-[4px] bg-line overflow-hidden"
        role="meter"
        aria-label={skill.name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={skill.level}
      >
        <div
          className="h-full w-[var(--skill-value)] bg-accent origin-left [[data-animated=true]_&]:animate-skill-fill"
          style={{ '--skill-value': skill.level + '%' } as CSSProperties}
        />
      </div>
    </li>
  );
}
