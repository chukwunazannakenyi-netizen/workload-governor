/**
 * Storybook stories for ActivityChart — closes #805
 *
 * Covers:
 *  - Empty         : contributor has zero activity (empty state message)
 *  - SingleWeek    : 7 data points spanning one week
 *  - FullYear      : 12 monthly data points (full year, tests no overflow/clip)
 *  - LoadingShimmer: chart in skeleton/loading state (isLoading prop)
 *  - HighVolume    : spike data to verify Y-axis auto-scaling
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ActivityChart } from '../components/ActivityChart';
import type { MonthlyActivity } from '../hooks/useActivityStats';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ActivityChart> = {
  title: 'Components/ActivityChart',
  component: ActivityChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'SVG bar chart showing monthly applied / assigned / completed counts for a contributor. ' +
          'Renders an accessible visually-hidden data table for screen readers. ' +
          'The `isLoading` prop triggers a shimmer skeleton overlay.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityChart>;

// ── Helper: generate N months of data ────────────────────────────────────────

function makeMonths(
  count: number,
  overrides?: Partial<MonthlyActivity>[],
): MonthlyActivity[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i): MonthlyActivity => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month,
      applied:   overrides?.[i]?.applied   ?? 0,
      assigned:  overrides?.[i]?.assigned  ?? 0,
      completed: overrides?.[i]?.completed ?? 0,
    };
  });
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Contributor has zero activity. The component renders an appropriate empty
 * state message instead of an empty chart.
 */
export const Empty: Story = {
  name: 'Empty — no activity data',
  args: {
    activity: [],
  },
};

/**
 * Seven data points spanning one week of reported months. Tests that the
 * chart renders and scales correctly for small data sets.
 */
export const SingleWeek: Story = {
  name: 'SingleWeek — 7 data points',
  args: {
    activity: makeMonths(7, [
      { applied: 1, assigned: 0, completed: 0 },
      { applied: 2, assigned: 1, completed: 0 },
      { applied: 3, assigned: 2, completed: 1 },
      { applied: 1, assigned: 1, completed: 1 },
      { applied: 0, assigned: 1, completed: 2 },
      { applied: 2, assigned: 0, completed: 1 },
      { applied: 1, assigned: 1, completed: 0 },
    ]),
  },
};

/**
 * 12 monthly data points (one full year). Tests that the chart does not
 * overflow or clip its container at the standard width.
 */
export const FullYear: Story = {
  name: 'FullYear — 12 monthly data points',
  args: {
    activity: makeMonths(12, [
      { applied: 2, assigned: 1, completed: 1 },
      { applied: 3, assigned: 2, completed: 1 },
      { applied: 4, assigned: 3, completed: 2 },
      { applied: 5, assigned: 4, completed: 3 },
      { applied: 6, assigned: 5, completed: 4 },
      { applied: 7, assigned: 5, completed: 5 },
      { applied: 6, assigned: 4, completed: 5 },
      { applied: 5, assigned: 3, completed: 4 },
      { applied: 4, assigned: 3, completed: 3 },
      { applied: 3, assigned: 2, completed: 3 },
      { applied: 2, assigned: 2, completed: 2 },
      { applied: 1, assigned: 1, completed: 2 },
    ]),
  },
};

/**
 * Chart in skeleton / loading state. Renders a shimmer placeholder matching
 * the chart dimensions. Uses the `isLoading` prop added as part of #805.
 */
export const LoadingShimmer: Story = {
  name: 'LoadingShimmer — skeleton state',
  args: {
    activity: [],
    isLoading: true,
  },
};

/**
 * Spike data with very high counts. Verifies that the Y-axis scales correctly
 * and bars do not overflow the SVG viewport.
 */
export const HighVolume: Story = {
  name: 'HighVolume — spike data, axis auto-scaling',
  args: {
    activity: makeMonths(12, [
      { applied: 5,   assigned: 3,  completed: 2  },
      { applied: 10,  assigned: 7,  completed: 5  },
      { applied: 25,  assigned: 18, completed: 10 },
      { applied: 50,  assigned: 40, completed: 30 },
      { applied: 100, assigned: 80, completed: 70 },
      { applied: 80,  assigned: 60, completed: 55 },
      { applied: 40,  assigned: 30, completed: 28 },
      { applied: 20,  assigned: 15, completed: 12 },
      { applied: 8,   assigned: 5,  completed: 4  },
      { applied: 3,   assigned: 2,  completed: 2  },
      { applied: 1,   assigned: 1,  completed: 1  },
      { applied: 2,   assigned: 2,  completed: 1  },
    ]),
  },
};
