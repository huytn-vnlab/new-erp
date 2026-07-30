Primary action control — use `variant="primary"` for the one main action per view, `outline`/`ghost` for secondary, `danger`/`success` for destructive/confirming.

```jsx
<Button variant="primary" size="md" icon={<Icon.Plus size={14}/>}>Thêm nhân viên</Button>
<Button variant="outline">Hủy</Button>
<Button variant="ghost" size="sm">Xem thêm</Button>
```

Variants: `primary` (gradient, scales on hover, presses to 0.98), `outline`, `ghost`, `danger`, `success`. Sizes: `xs` (28px), `sm` (32px), `md` (36px, default). Pass `icon` as a rendered node.
