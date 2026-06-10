// Export composable — PDF and Excel download helpers
// Calls backend endpoints that return file blobs

export function useExport() {
  const { post } = useApi()
  const toast    = useToast()

  /**
   * Trigger a file download from a blob response.
   */
  function downloadBlob(blob: Blob, filename: string) {
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  /**
   * Export a resource as Excel (.xlsx).
   * The backend endpoint should return a blob with content-type
   * application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   */
  async function exportExcel(endpoint: string, payload: Record<string, any>, filename: string) {
    try {
      // useApi().post is JSON — for blob we call fetch directly
      const config = useRuntimeConfig()
      const token  = useCookie('auth_token').value
      const res = await fetch(`${config.public.apiBase}${endpoint}`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Export thất bại')
      const blob = await res.blob()
      downloadBlob(blob, filename)
      toast.success(`Đã xuất ${filename}`)
    } catch (err: any) {
      toast.error(err?.message ?? 'Xuất file thất bại')
    }
  }

  /**
   * Export a resource as PDF.
   */
  async function exportPdf(endpoint: string, payload: Record<string, any>, filename: string) {
    try {
      const config = useRuntimeConfig()
      const token  = useCookie('auth_token').value
      const res = await fetch(`${config.public.apiBase}${endpoint}`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Export thất bại')
      const blob = await res.blob()
      downloadBlob(blob, filename)
      toast.success(`Đã xuất ${filename}`)
    } catch (err: any) {
      toast.error(err?.message ?? 'Xuất PDF thất bại')
    }
  }

  // ── Convenience helpers ────────────────────────────────────────────────────

  const exportTimekeeping = (month: string, userId?: number) =>
    exportExcel('/export/timekeeping', { month, user_id: userId }, `chamcong_${month}.xlsx`)

  const exportLeave = (year: number, userId?: number) =>
    exportExcel('/export/leave', { year, user_id: userId }, `phep_${year}.xlsx`)

  const exportPayroll = (month: string) =>
    exportExcel('/export/payroll', { month }, `bangluong_${month}.xlsx`)

  const exportEvaluation = (id: number) =>
    exportPdf('/export/evaluation', { id }, `danhgia_${id}.pdf`)

  const exportContract = (id: number) =>
    exportPdf('/export/contract', { id }, `hopdong_${id}.pdf`)

  return {
    exportExcel,
    exportPdf,
    exportTimekeeping,
    exportLeave,
    exportPayroll,
    exportEvaluation,
    exportContract,
  }
}
