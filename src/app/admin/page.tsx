'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LeadSubmission } from '@/types/lead'
import { CheckCircle2, Search, Download, ChevronLeft, ChevronRight, Users, FileText } from 'lucide-react'

const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'shim.stealer96@gmail.com',
].filter(Boolean)

const PAGE_SIZE = 20

const statusOptions = [
  '신규', '혜택 제공 대기', '혜택 제공 완료', '진단 대기', '진단 완료',
  '할인권 발송 완료', '7일 무료 체험 시작', '전자책 구매', '유료 멤버십 전환',
  '상담 필요', '관심 낮음', '수신 거부',
]

const sourceLabel: Record<string, string> = {
  landing_form: '랜딩페이지',
  cta_popup: '무료분석 팝업',
  onboarding: '온보딩',
}

const inputClass = 'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm transition-colors'

const planBadge = (plan: string) => {
  if (plan === 'pro') return 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
  if (plan === 'trial') return 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
  return 'bg-slate-700/60 text-slate-400 border border-slate-600'
}

interface Filters {
  search: string; source: string; status: string
  investment_experience: string; investment_interest: string
}

interface UserRow {
  id: string; email: string; name: string; avatar: string | null
  provider: string; created_at: string; last_sign_in: string | null
  plan: string; trial_ends_at: string | null; trade_count: number
}

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [tab, setTab] = useState<'leads' | 'users'>('leads')

  // ── 리드 상태
  const [leads, setLeads] = useState<LeadSubmission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<Filters>({
    search: '', source: '', status: '', investment_experience: '', investment_interest: '',
  })
  const [editMemo, setEditMemo] = useState<Record<string, string>>({})
  const [leadsLoading, setLeadsLoading] = useState(true)

  // ── 가입자 상태
  const [users, setUsers] = useState<UserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  // ── 인증
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email ?? ''
      if (ADMIN_EMAILS.includes(email)) setAuthorized(true)
      else { setAuthorized(false); router.replace('/dashboard') }
    })
  }, [router])

  // ── 리드 조회
  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('lead_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    if (filters.source) query = query.eq('source', filters.source)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.investment_experience) query = query.eq('investment_experience', filters.investment_experience)
    if (filters.investment_interest) query = query.eq('investment_interest', filters.investment_interest)
    if (filters.search) query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    const { data, count } = await query
    setLeads((data as LeadSubmission[]) ?? [])
    setTotal(count ?? 0)
    setLeadsLoading(false)
  }, [page, filters])

  useEffect(() => { if (authorized) fetchLeads() }, [authorized, fetchLeads])

  // ── 가입자 조회
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    const res = await fetch('/api/admin/users', {
      credentials: 'include',
    })
    if (res.ok) {
      const json = await res.json()
      setUsers(json.users ?? [])
    }
    setUsersLoading(false)
  }, [])

  useEffect(() => {
    if (authorized && tab === 'users') fetchUsers()
  }, [authorized, tab, fetchUsers])

  const updateField = async (id: string, field: string, value: unknown) => {
    const supabase = createClient()
    await supabase.from('lead_submissions').update({ [field]: value }).eq('id', id)
    fetchLeads()
  }

  const exportLeadsCSV = () => {
    const headers = ['신청일시', '유입경로', '성함', '연락처', '이메일', '투자경험', '관심투자', '막히는부분', '원하는혜택', '상태', '쿠폰발송', '메모']
    const rows = leads.map(l => [
      l.created_at ?? '', sourceLabel[l.source] ?? l.source, l.name, l.phone, l.email,
      l.investment_experience ?? '', l.investment_interest ?? '', l.pain_point ?? '',
      (l.desired_benefits ?? []).join(' / '), l.status ?? '', l.coupon_sent ? 'O' : 'X', l.admin_memo ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportUsersCSV = () => {
    const headers = ['가입일', '이름', '이메일', '로그인방식', '플랜', '체험만료일', '매매기록수', '마지막로그인']
    const rows = filteredUsers.map(u => [
      u.created_at ? new Date(u.created_at).toLocaleDateString('ko-KR') : '',
      u.name, u.email, u.provider, u.plan,
      u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString('ko-KR') : '',
      u.trade_count,
      u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('ko-KR') : '',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase())
  )

  if (authorized === null) {
    return <div className="min-h-screen bg-[#090d16] flex items-center justify-center"><p className="text-slate-500">확인 중...</p></div>
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#090d16] px-4 py-10">
      <div className="max-w-7xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-100">관리자</h1>
          <button
            onClick={tab === 'leads' ? exportLeadsCSV : exportUsersCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV 다운로드
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('leads')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'leads' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <FileText className="h-4 w-4" />
            신청자 DB
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'leads' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{total}</span>
          </button>
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <Users className="h-4 w-4" />
            가입자 목록
            {users.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'users' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{users.length}</span>
            )}
          </button>
        </div>

        {/* ══════════════ 신청자 DB 탭 ══════════════ */}
        {tab === 'leads' && (
          <>
            {/* 필터 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input type="text" placeholder="이름/연락처/이메일" value={filters.search}
                    onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(0) }}
                    className={`${inputClass} pl-9 w-full`} />
                </div>
                <select value={filters.source} onChange={e => { setFilters(f => ({ ...f, source: e.target.value })); setPage(0) }} className={`${inputClass} w-full`}>
                  <option value="">전체 유입경로</option>
                  <option value="landing_form">랜딩페이지</option>
                  <option value="cta_popup">무료분석 팝업</option>
                  <option value="onboarding">온보딩</option>
                </select>
                <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(0) }} className={`${inputClass} w-full`}>
                  <option value="">전체 상태</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filters.investment_experience} onChange={e => { setFilters(f => ({ ...f, investment_experience: e.target.value })); setPage(0) }} className={`${inputClass} w-full`}>
                  <option value="">전체 투자경험</option>
                  {['아직 시작 전','계좌는 있지만 거의 안 함','주식 현물 경험 있음','주식 선물 경험 있음','코인 현물 경험 있음','코인 선물 경험 있음','현재 손실 중','꾸준히 매매 중'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={filters.investment_interest} onChange={e => { setFilters(f => ({ ...f, investment_interest: e.target.value })); setPage(0) }} className={`${inputClass} w-full`}>
                  <option value="">전체 관심투자</option>
                  {['주식 현물','주식 선물','코인 현물','코인 선물','주식과 코인 둘 다','아직 모르겠음'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* 테이블 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
              {leadsLoading ? (
                <div className="p-10 text-center text-slate-500">로딩 중...</div>
              ) : leads.length === 0 ? (
                <div className="p-10 text-center text-slate-500">데이터가 없습니다.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-xs">
                        {['신청일시','유입경로','성함','연락처','이메일','투자경험','관심투자','막히는부분','원하는혜택','상태','쿠폰','메모'].map(h => (
                          <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                            {lead.created_at ? new Date(lead.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${lead.source === 'landing_form' ? 'bg-blue-500/10 text-blue-400' : lead.source === 'cta_popup' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {sourceLabel[lead.source] ?? lead.source}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-200 font-medium whitespace-nowrap">{lead.name}</td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{lead.phone}</td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{lead.email}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{lead.investment_experience ?? '-'}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{lead.investment_interest ?? '-'}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px] truncate">{lead.pain_point ?? '-'}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px] truncate">{(lead.desired_benefits ?? []).join(', ') || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select value={lead.status ?? '신규'} onChange={e => updateField(lead.id!, 'status', e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500">
                              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => updateField(lead.id!, 'coupon_sent', !lead.coupon_sent)}
                              className={`transition-colors ${lead.coupon_sent ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}>
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <input type="text" value={editMemo[lead.id!] ?? lead.admin_memo ?? ''}
                              onChange={e => setEditMemo(m => ({ ...m, [lead.id!]: e.target.value }))}
                              onBlur={e => { if (e.target.value !== (lead.admin_memo ?? '')) updateField(lead.id!, 'admin_memo', e.target.value) }}
                              placeholder="메모..." className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 text-slate-400 text-xs py-1 focus:outline-none placeholder-slate-600 min-w-[120px]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-slate-500 text-sm">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} / {total}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-slate-400 text-sm">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════ 가입자 목록 탭 ══════════════ */}
        {tab === 'users' && (
          <>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input type="text" placeholder="이름 또는 이메일 검색" value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className={`${inputClass} pl-9 w-full`} />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
              {usersLoading ? (
                <div className="p-10 text-center text-slate-500">로딩 중...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-500">가입자가 없습니다.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-xs">
                        {['가입일','이름','이메일','로그인','플랜','체험만료','매매기록','마지막로그인'].map(h => (
                          <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                            {new Date(u.created_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {u.avatar && <img src={u.avatar} alt="" className="w-6 h-6 rounded-full" />}
                              <span className="text-slate-200 font-medium whitespace-nowrap">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">{u.provider}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${planBadge(u.plan)}`}>
                              {u.plan === 'pro' ? 'Pro' : u.plan === 'trial' ? '체험중' : u.plan === 'free' ? '무료' : u.plan}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-bold ${u.trade_count > 0 ? 'text-blue-400' : 'text-slate-600'}`}>
                              {u.trade_count}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {filteredUsers.length > 0 && (
              <p className="text-xs text-slate-600 text-center mt-4">총 {filteredUsers.length}명</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
