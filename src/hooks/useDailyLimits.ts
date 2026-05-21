'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDailyLimits() {
  const [journalCountToday, setJournalCountToday] = useState(0)
  const [analysisCountToday, setAnalysisCountToday] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function fetchCounts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Today in Asia/Seoul (UTC+9)
      const now = new Date()
      const seoulOffset = 9 * 60 * 60 * 1000
      const utcOffset = now.getTimezoneOffset() * 60 * 1000
      const seoulNow = new Date(now.getTime() + utcOffset + seoulOffset)
      const todaySeoulStart = new Date(seoulNow)
      todaySeoulStart.setHours(0, 0, 0, 0)
      const todaySeoulEnd = new Date(seoulNow)
      todaySeoulEnd.setHours(23, 59, 59, 999)
      // Convert back to UTC
      const startUTC = new Date(todaySeoulStart.getTime() - utcOffset - seoulOffset).toISOString()
      const endUTC = new Date(todaySeoulEnd.getTime() - utcOffset - seoulOffset).toISOString()

      const [{ count: jCount }, { count: aCount }] = await Promise.all([
        supabase.from('trades').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startUTC)
          .lte('created_at', endUTC),
        supabase.from('analysis_runs').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('run_at', startUTC)
          .lte('run_at', endUTC),
      ])

      setJournalCountToday(jCount || 0)
      setAnalysisCountToday(aCount || 0)
      setLoading(false)
    }
    fetchCounts()
  }, [])

  return {
    journalCountToday,
    analysisCountToday,
    canAddJournal: (limit: number) => journalCountToday < limit,
    canRunAnalysis: (limit: number) => analysisCountToday < limit,
    loading,
  }
}
