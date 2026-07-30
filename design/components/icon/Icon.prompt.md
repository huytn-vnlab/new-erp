Single icon primitive. Icons are monochrome and inherit `color`, so tint by setting text color on a parent (e.g. `text-muted-foreground`, accent).

```jsx
<Icon name="Users" size={16} />
<span style={{color:'hsl(var(--primary))'}}><Icon name="TrendUp" size={14}/></span>
```

Stroke weight is 1.7 by default — keep it consistent. Needs a glyph in the `PATHS` map; the complete set (~55 glyphs) is in `assets/icons.jsx`, copy additions from there.
