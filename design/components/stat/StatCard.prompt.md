Headline KPI for dashboards and page headers. Keep the label short & uppercase; the number is the hero.

```jsx
<StatCard label="Tổng nhân viên" value="248" sublabel="12 phòng ban"
  trend={{dir:'up', value:'+8'}} icon={<Icon.Users size={18}/>} accent="primary" />
```

For a compact inline metric (no icon tile) use the source `MiniStat` in `page-shell.jsx`.
