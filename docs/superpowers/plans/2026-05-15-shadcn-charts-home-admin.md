# shadcn-vue Charts – home-admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 4 Chart.js (`AppChart`) charts in `home-admin.vue`'s "Thông tin của bạn" tab with shadcn-vue chart components (Unovis) for a more polished UI.

**Architecture:** The shadcn-vue chart components (`BarChart`, `LineChart`, `DonutChart`) are already installed under `components/ui/chart-bar`, `chart-line`, `chart-donut`. They expect flat-array data (`T[]` where each item has an index key + category keys) instead of Chart.js's `{ labels, datasets }` format. We reshape existing reactive refs in-place — no API changes, no new stores.

**Tech Stack:** Vue 3, Nuxt 3, `@unovis/vue`, shadcn-vue chart components, Tailwind CSS v4.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `assets/css/main.css` | Modify | Add `--vis-primary-color` / `--vis-secondary-color` / `--vis-text-color` CSS vars |
| `pages/home-admin.vue` | Modify | Replace chart refs, data transforms, template chart components, remove old imports |

---

### Task 1: Add Unovis CSS variables to main.css

Unovis reads `--vis-primary-color` and `--vis-secondary-color` for default chart colours. Without these the charts fall back to a teal/orange palette that clashes with our `#109cf1` primary.

**Files:**
- Modify: `assets/css/main.css`

- [ ] **Step 1: Add Unovis theme variables inside the bare `:root` block** (the one at the bottom of the file, around line 223)

  Open `assets/css/main.css` and add to the bare `:root { }` block:

  ```css
  :root {
    /* existing sidebar vars … */
    --sidebar: hsl(203 50% 97%);
    /* … */

    /* Unovis chart colours (used by shadcn-vue chart components) */
    --vis-primary-color:   203 89% 52%;   /* matches #109cf1 */
    --vis-secondary-color: 203 60% 68%;   /* lighter tint */
    --vis-text-color:      var(--foreground);
  }
  ```

  And add the dark-mode counterpart inside the bare `.dark { }` block:

  ```css
  .dark {
    /* existing sidebar vars … */

    --vis-primary-color:   203 89% 63%;
    --vis-secondary-color: 203 50% 45%;
    --vis-text-color:      var(--foreground);
  }
  ```

- [ ] **Step 2: Verify the dev server compiles without errors**

  Check browser console / terminal – no CSS parse errors expected.

---

### Task 2: Rewrite chart state in home-admin.vue script

Replace Chart.js typed refs and option objects with flat-array refs that the Unovis components consume.

**Files:**
- Modify: `pages/home-admin.vue` (script section)

- [ ] **Step 1: Remove Chart.js imports**

  Delete this line at the top of `<script setup>`:
  ```ts
  import type { ChartData, ChartOptions } from 'chart.js'
  ```

- [ ] **Step 2: Remove the old chart data refs** (lines ~343–348)

  Remove:
  ```ts
  const jobTitleChartData    = ref<ChartData<'bar'>>({ labels: [], datasets: [] })
  const jpLevelChartData     = ref<ChartData<'bar'>>({ labels: [], datasets: [] })
  const techChartData        = ref<ChartData<'bar'>>({ labels: [], datasets: [] })
  const evaluationChartData  = ref<ChartData<'bar'>>({ labels: [], datasets: [] })
  const rankGrowthChartData  = ref<ChartData<'line'>>({ labels: [], datasets: [] })
  const dayOffChartData      = ref<ChartData<'doughnut'>>({ labels: [], datasets: [] })
  ```

- [ ] **Step 3: Remove old Chart.js option objects** (lines ~350–378)

  Remove:
  ```ts
  const horizontalBarOptions: ChartOptions<'bar'> = { ... }
  const stackedBarOptions:    ChartOptions<'bar'> = { ... }
  const pieOptions:           ChartOptions<'doughnut'> = { ... }
  const barOptions:           ChartOptions<'bar'>  = { ... }
  const lineOptions:          ChartOptions<'line'> = { ... }
  ```

- [ ] **Step 4: Add new flat-array refs**

  Add after the `statsLoading` ref:

  ```ts
  // ── Unovis chart data (flat-array format) ─────────────────────────────────
  type TimekeepingRow  = { month: string; ngayCong: number }
  type LeaveMonthRow   = { month: string; ngayNghi: number }
  type RankGrowthRow   = { ngay: string;  rank: number }
  type DayOffRow       = { nhan: string;  ngay: number }

  const timekeepingChartData = ref<TimekeepingRow[]>([])
  const leaveChartData       = ref<LeaveMonthRow[]>([])
  const rankGrowthData       = ref<RankGrowthRow[]>([])
  const dayOffData           = ref<DayOffRow[]>([])
  ```

- [ ] **Step 5: Remove old AppChart import**

  Remove:
  ```ts
  import AppChart from '~/components/ui/AppChart.vue'
  ```

- [ ] **Step 6: Add shadcn-vue chart imports**

  Add:
  ```ts
  import { BarChart }   from '~/components/ui/chart-bar'
  import { LineChart }  from '~/components/ui/chart-line'
  import { DonutChart } from '~/components/ui/chart-donut'
  ```

---

### Task 3: Update fetchStatCards() data transforms

`fetchStatCards()` populates `rankGrowthChartData` and `dayOffChartData`. Replace with Unovis format.

**Files:**
- Modify: `pages/home-admin.vue` (fetchStatCards function, lines ~451–470)

- [ ] **Step 1: Replace rankGrowthChartData assignment**

  Find and replace:
  ```ts
  rankGrowthChartData.value = {
    labels: userRankLogs.value.map(x => x.created_at.split(' ')[0]),
    datasets: [{
      label: 'Rank',
      data: userRankLogs.value.map(x => x.rank),
      borderColor: '#00875A',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.1
    }]
  }
  ```
  With:
  ```ts
  rankGrowthData.value = userRankLogs.value.map(x => ({
    ngay: x.created_at.split(' ')[0],
    rank: x.rank,
  }))
  ```

- [ ] **Step 2: Replace dayOffChartData assignment**

  Find and replace:
  ```ts
  const dayOffLabels = Object.keys(dayOffInfo.value)
  dayOffChartData.value = {
    labels: dayOffLabels.map(l => l === 'day_used' ? 'Đã nghỉ' : 'Còn lại'),
    datasets: [{
      data: dayOffLabels.map(l => parseFloat(dayOffInfo.value[l] || '0').toFixed(2)),
      backgroundColor: ['#F7685B', '#2ED47A'],
    }]
  }
  ```
  With:
  ```ts
  dayOffData.value = [
    { nhan: 'Đã nghỉ',  ngay: parseFloat(dayOffInfo.value['day_used']      || '0') },
    { nhan: 'Còn lại',  ngay: parseFloat(dayOffInfo.value['day_remaining']  || '0') },
  ]
  ```

  > **Note:** The original code iterated `Object.keys(dayOffInfo.value)` without knowing the key order. Here we explicitly map `day_used` → "Đã nghỉ" and everything else → "Còn lại". Adjust the second key (`day_remaining`) if the API uses a different name — check the response shape in `fetchStatCards`.

---

### Task 4: Update fetchChartData() data transforms

`fetchChartData()` populates `timekeepingChartData` and `leaveChartData`.

**Files:**
- Modify: `pages/home-admin.vue` (fetchChartData function, lines ~578–613)

- [ ] **Step 1: Replace timekeepingChartData assignment** (lines ~578–586)

  Find and replace:
  ```ts
  timekeepingChartData.value = {
    labels,
    datasets: [{
      label:           'Ngày công',
      data:            tkCounts,
      backgroundColor: 'rgba(16,156,241,0.7)',
      borderRadius:    4,
    }],
  }
  ```
  With:
  ```ts
  timekeepingChartData.value = labels.map((month, i) => ({
    month,
    ngayCong: tkCounts[i] ?? 0,
  }))
  ```

- [ ] **Step 2: Replace leaveChartData assignment** (lines ~602–613)

  Find and replace:
  ```ts
  leaveChartData.value = {
    labels,
    datasets: [{
      label:           'Ngày nghỉ',
      data:            months.map(m => lvMap[m] ?? 0),
      borderColor:     '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      fill:            true,
      tension:         0.4,
      pointRadius:     4,
    }],
  }
  ```
  With:
  ```ts
  leaveChartData.value = labels.map((month, i) => ({
    month,
    ngayNghi: lvMap[months[i]] ?? 0,
  }))
  ```

---

### Task 5: Replace chart components in template

Swap the 4 `<AppChart>` usages in the "Thông tin của bạn" `TabsContent` for shadcn-vue components.

**Files:**
- Modify: `pages/home-admin.vue` (template, lines ~202–267)

- [ ] **Step 1: Replace "Tăng trưởng rank" (Line)**

  Find:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Tăng trưởng rank</CardTitle>
    </CardHeader>
    <CardContent>
      <AppChart
        type="line"
        :data="rankGrowthChartData"
        :options="lineOptions"
        :height="220"
      />
    </CardContent>
  </Card>
  ```
  Replace with:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Tăng trưởng rank</CardTitle>
    </CardHeader>
    <CardContent class="pt-0">
      <LineChart
        :data="rankGrowthData"
        index="ngay"
        :categories="['rank']"
        class="h-[220px]"
        :show-legend="false"
        :y-formatter="(v) => String(v)"
      />
    </CardContent>
  </Card>
  ```

- [ ] **Step 2: Replace "Thông tin ngày phép" (Donut)**

  Find:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Thông tin ngày phép</CardTitle>
    </CardHeader>
    <CardContent>
      <AppChart
        type="doughnut"
        :data="dayOffChartData"
        :options="pieOptions"
        :height="220"
      />
    </CardContent>
  </Card>
  ```
  Replace with:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Thông tin ngày phép</CardTitle>
    </CardHeader>
    <CardContent class="pt-0">
      <DonutChart
        :data="dayOffData"
        index="nhan"
        category="ngay"
        class="h-[220px]"
        :colors="['#F7685B', '#2ED47A']"
        :value-formatter="(v) => `${v} ngày`"
      />
    </CardContent>
  </Card>
  ```

- [ ] **Step 3: Replace "Chấm công 6 tháng" (Bar)**

  Find:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Chấm công 6 tháng gần nhất</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="chartsLoading" class="flex items-center justify-center h-64">
        <AppSpinner />
      </div>
      <AppChart
        v-else
        type="bar"
        :data="timekeepingChartData"
        :options="barOptions"
        :height="220"
      />
    </CardContent>
  </Card>
  ```
  Replace with:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Chấm công 6 tháng gần nhất</CardTitle>
    </CardHeader>
    <CardContent class="pt-0">
      <div v-if="chartsLoading" class="flex items-center justify-center h-[220px]">
        <AppSpinner />
      </div>
      <BarChart
        v-else
        :data="timekeepingChartData"
        index="month"
        :categories="['ngayCong']"
        class="h-[220px]"
        :show-legend="false"
        :rounded-corners="4"
        :y-formatter="(v) => `${v}`"
      />
    </CardContent>
  </Card>
  ```

- [ ] **Step 4: Replace "Nghỉ phép 6 tháng" (Line)**

  Find:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Nghỉ phép 6 tháng gần nhất</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="chartsLoading" class="flex items-center justify-center h-64">
        <AppSpinner />
      </div>
      <AppChart
        v-else
        type="line"
        :data="leaveChartData"
        :options="lineOptions"
        :height="220"
      />
    </CardContent>
  </Card>
  ```
  Replace with:
  ```html
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-semibold">Nghỉ phép 6 tháng gần nhất</CardTitle>
    </CardHeader>
    <CardContent class="pt-0">
      <div v-if="chartsLoading" class="flex items-center justify-center h-[220px]">
        <AppSpinner />
      </div>
      <LineChart
        v-else
        :data="leaveChartData"
        index="month"
        :categories="['ngayNghi']"
        class="h-[220px]"
        :show-legend="false"
        :y-formatter="(v) => `${v}`"
      />
    </CardContent>
  </Card>
  ```

---

### Task 6: Verify and clean up

- [ ] **Step 1: Check for leftover Chart.js references**

  Run in terminal:
  ```bash
  grep -n "AppChart\|ChartData\|ChartOptions\|rankGrowthChartData\|dayOffChartData\|barOptions\|lineOptions\|pieOptions\|horizontalBarOptions\|stackedBarOptions" pages/home-admin.vue
  ```
  Expected: no output.

- [ ] **Step 2: Check dev server has no TypeScript errors**

  Run:
  ```bash
  npx nuxi typecheck 2>&1 | grep -E "error|home-admin"
  ```
  Expected: no errors related to `home-admin.vue`.

- [ ] **Step 3: Smoke-test in browser**

  Navigate to `/home-admin` → click "Thông tin của bạn" tab.
  - Bar chart renders with 6 month labels
  - Line chart (leave) renders with 6 data points
  - Line chart (rank) renders (may be empty if no rank logs)
  - Donut chart renders with red/green segments

