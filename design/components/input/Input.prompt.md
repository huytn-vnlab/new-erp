Text field for filters, search, and forms. Pass a leading `icon` for search/contextual fields.

```jsx
<Input icon={<Icon.Search size={14}/>} placeholder="Tìm nhân viên…" value={q} onChange={e=>setQ(e.target.value)} />
```

Rests on a muted tint; focus turns the border accent-blue with no outline ring. For selects, dates, and times use the dedicated `Select` / `DatePicker` / `TimePicker` primitives (in the source `page-shell.jsx`).
