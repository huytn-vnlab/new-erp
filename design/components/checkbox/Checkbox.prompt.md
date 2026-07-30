Boolean toggle for forms and table row/select-all. Use `indeterminate` for a header checkbox when some (not all) rows are selected.

```jsx
<Checkbox checked={sel} onChange={e=>setSel(e.target.checked)} label="Nhận thông báo email" />
<Checkbox indeterminate onChange={toggleAll} />
```
