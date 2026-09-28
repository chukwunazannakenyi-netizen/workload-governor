/**
 * Tests for CapacityBars — issue #804
 *
 * Covers:
 *  1. Renders global bar at 0/15 (empty — all bars empty, fill width 0%)
 *  2. Renders partial fill (3/4 org assignments — correct filled vs empty)
 *  3. Renders at full cap (15/15 global — fill width 100%)
 *  4. Renders without error when orgCounts contains a zero-assignment entry
 *  5. Correct ARIA attributes on all progress bars
 *  6. Snapshot baseline regression
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CapacityBars } from '../CapacityBars';
import type { OrgCount } from '../CapacityBars';

describe('CapacityBars', () => {
  // ── 1. Empty global bar ───────────────────────────────────────────────────
  it('unit_renders_empty_global_bar — renders global bar at 0/15 with fill width 0%', () => {
    render(<CapacityBars globalApplications={0} orgCounts={[]} />);

    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(1);

    const globalBar = bars[0];
    expect(globalBar).toHaveAttribute('aria-valuenow', '0');
    expect(globalBar).toHaveAttribute('aria-valuemin', '0');
    expect(globalBar).toHaveAttribute('aria-valuemax', '15');

    // The fill element should have width 0%
    const fill = globalBar.querySelector('.cap-bar__fill') as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('0%');
  });

  // ── 2. Partial fill ───────────────────────────────────────────────────────
  it('unit_renders_partial_fill — 3/4 org assignments shows correct progressbar values and 75% fill', () => {
    const orgCounts: OrgCount[] = [{ org: 'stellar-org', assignments: 3 }];
    render(<CapacityBars globalApplications={5} orgCounts={orgCounts} />);

    const bars = screen.getAllByRole('progressbar');
    // global bar + 1 org bar
    expect(bars).toHaveLength(2);

    const orgBar = bars[1];
    expect(orgBar).toHaveAttribute('aria-valuenow', '3');
    expect(orgBar).toHaveAttribute('aria-valuemax', '4');

    const fill = orgBar.querySelector('.cap-bar__fill') as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('75%');
  });

  // ── 3. Full cap ───────────────────────────────────────────────────────────
  it('unit_renders_at_full_cap — global at 15/15 has fill width 100%', () => {
    render(<CapacityBars globalApplications={15} orgCounts={[]} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '15');
    expect(bar).toHaveAttribute('aria-valuemax', '15');

    const fill = bar.querySelector('.cap-bar__fill') as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('100%');
  });

  // ── 4. Zero-assignment org edge case ──────────────────────────────────────
  it('unit_renders_zero_assignment_org_without_error — zero-assignment org entry renders without throwing', () => {
    const orgCounts: OrgCount[] = [{ org: 'empty-org', assignments: 0 }];

    expect(() =>
      render(<CapacityBars globalApplications={0} orgCounts={orgCounts} />)
    ).not.toThrow();

    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(2); // global + org

    const orgBar = bars[1];
    expect(orgBar).toHaveAttribute('aria-valuenow', '0');

    const fill = orgBar.querySelector('.cap-bar__fill') as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('0%');
  });

  // ── 5. ARIA attributes ────────────────────────────────────────────────────
  it('unit_renders_aria_attributes — progressbar role, aria-valuenow, aria-valuemin, aria-valuemax, aria-label', () => {
    const orgCounts: OrgCount[] = [
      { org: 'stellar-org',  assignments: 2 },
      { org: 'meridian-dao', assignments: 4 },
    ];
    render(<CapacityBars globalApplications={8} orgCounts={orgCounts} />);

    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(3); // global + 2 orgs

    // Global bar
    expect(bars[0]).toHaveAttribute('aria-valuenow', '8');
    expect(bars[0]).toHaveAttribute('aria-valuemin', '0');
    expect(bars[0]).toHaveAttribute('aria-valuemax', '15');
    expect(bars[0]).toHaveAttribute('aria-label', 'Global applications: 8 of 15');

    // First org bar
    expect(bars[1]).toHaveAttribute('aria-valuenow', '2');
    expect(bars[1]).toHaveAttribute('aria-valuemin', '0');
    expect(bars[1]).toHaveAttribute('aria-valuemax', '4');
    expect(bars[1]).toHaveAttribute('aria-label', 'stellar-org: 2 of 4');

    // Full org bar
    expect(bars[2]).toHaveAttribute('aria-valuenow', '4');
    expect(bars[2]).toHaveAttribute('aria-valuemax', '4');
  });

  // ── 6. Snapshot baseline ──────────────────────────────────────────────────
  it('unit_snapshot_baseline — snapshot regression for CapacityBars HTML structure', () => {
    const orgCounts: OrgCount[] = [
      { org: 'stellar-org', assignments: 2 },
    ];
    const { container } = render(
      <CapacityBars globalApplications={5} orgCounts={orgCounts} />
    );
    expect(container).toMatchSnapshot();
  });
});
