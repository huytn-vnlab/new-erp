The default surface for grouped content — panels, tables, stat blocks. Non-interactive by default.

```jsx
<Card>…</Card>
<Card interactive onClick={open}>…</Card>   {/* clickable, lifts on hover */}
<Card tint>…</Card>                          {/* stat card with accent glow */}
```

14px radius everywhere. Don't nest cards; use dividers (`hsl(var(--border))`) inside instead.
