export default defineAppConfig({
  accents: {
    sky: { h: 203, s: 89, label: 'Sky' },
    indigo: { h: 243, s: 75, label: 'Indigo' },
    emerald: { h: 160, s: 70, label: 'Emerald' },
    coral: { h: 14, s: 82, label: 'Coral' },
    violet: { h: 280, s: 65, label: 'Violet' },
  } as Record<string, { h: number; s: number; label: string }>,
})
