type BadgeVariant = 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet'

// cf.EvaluationStatus on the backend has 6 granular codes, but the UI now only
// exposes 3 canonical states — 1 (Đang tạo), 2 (Đã tạo), 6 (Đã duyệt). The old
// intermediate codes (3 MemberIsEditing, 4 MemberEdited, 5 VNManagerIsReviewing)
// still bucket into a label here so any pre-existing row displays correctly, but
// the app only ever WRITES 1/2/6 going forward (see submitForm in evaluation.vue).
// The backend mirrors this bucketing when filtering by status (see
// evaluationStatusGroups in pgrepository.go) so the list filter matches legacy rows too.
export const EVAL_STATUS_META: Record<number, { label: string; variant: BadgeVariant }> = {
  1: { label: 'Đang tạo', variant: 'gray' },
  2: { label: 'Đã tạo', variant: 'sky' },
  3: { label: 'Đang tạo', variant: 'gray' },
  4: { label: 'Đã tạo', variant: 'sky' },
  5: { label: 'Đã tạo', variant: 'sky' },
  6: { label: 'Đã duyệt', variant: 'green' },
}

// Canonical status codes the UI writes/offers — used to build the filter dropdown
// (dedup'd, unlike iterating the full bucketed EVAL_STATUS_META above).
export const EVAL_STATUS_CANONICAL: number[] = [1, 2, 6]

// cf.EvaluationRankList on the backend — a fixed, non-alphabetical map (not derived
// client-side from a score threshold like the design prototype does).
export const RANK_LETTER: Record<number, string> = { 1: 'D', 2: 'A', 3: 'B', 4: 'C', 5: 'S' }

export const RANK_COLOR: Record<string, string> = {
  S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308', D: '#f97316',
}
