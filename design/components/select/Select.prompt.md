Dropdown for filter bars and forms. The `onChange` payload mimics a native event (`e.target.value`) for drop-in familiarity.

```jsx
<Select value={dept} placeholder="Tất cả phòng ban"
  options={[{value:'eng',label:'Kỹ thuật'},{value:'hr',label:'Nhân sự'}]}
  onChange={e=>setDept(e.target.value)} />
```

Sibling pickers in the source: `DatePicker`, `TimePicker` (see `page-shell.jsx`) share this trigger/menu pattern.
