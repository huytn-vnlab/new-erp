# ERP Admin — UI kit

A faithful, interactive recreation of the **Micro ERP** admin console: the persistent sidebar + topbar shell wrapping the dashboard and HRM/workflow module screens (employees, leave, assets, contracts, timekeeping, evaluation, projects, recruitment, overtime, settings).

`index.html` reuses the live app source at the project root (via `<base href="../../">`) — sidebar, topbar, banner, charts, page-shell primitives, and every `page-*.jsx` module — so it stays pixel-identical to production without duplicating code. Theme toggle, locale switch, nav, tabs, filters, pagination, and the custom Select/DatePicker/TimePicker are all live.

Composed from the design system primitives: Button, Badge, Avatar, Input, Select, Checkbox, Card, StatCard, Pagination, Icon.
