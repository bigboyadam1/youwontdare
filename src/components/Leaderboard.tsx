import { useMemo } from 'react'
import type { Dare, BoardMember } from '../types'

interface LeaderboardProps {
  members: BoardMember[]
  dares: Dare[]
}

interface MemberStats {
  member: BoardMember
  daresGiven: number
  daresReceived: number
  completed: number
  chickened: number
  completionRate: number
}

export default function Leaderboard({ members, dares }: LeaderboardProps) {
  const rankings = useMemo(() => {
    const stats: MemberStats[] = members.map(member => {
      const given = dares.filter(d => d.darer_id === member.id).length
      const received = dares.filter(d => d.dared_id === member.id)
      const completed = received.filter(d => d.status === 'completed').length
      const chickened = received.filter(d => d.status === 'chickened').length
      const rate = received.length > 0 ? completed / received.length : 0

      return {
        member,
        daresGiven: given,
        daresReceived: received.length,
        completed,
        chickened,
        completionRate: rate,
      }
    })

    return stats.sort((a, b) => {
      if (b.completionRate !== a.completionRate) return b.completionRate - a.completionRate
      return b.completed - a.completed
    })
  }, [members, dares])

  const topCompleter = rankings.find(r => r.completed > 0)
  const biggestChicken = [...rankings].sort((a, b) => b.chickened - a.chickened).find(r => r.chickened > 0)

  return (
    <details
      open
      style={{
        marginBottom: 24,
        background: '#131313',
        border: '1px solid #555048',
        padding: 0,
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: '12px 16px',
          listStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span className="font-[Anton]" style={{ fontSize: 20, color: '#f0f0f0', letterSpacing: 1 }}>
          LEADERBOARD
        </span>
        <span className="font-[Courier_Prime]" style={{ fontSize: 12, color: '#555048' }}>
          ▼
        </span>
      </summary>

      <div style={{ padding: '0 16px 16px' }}>
        {/* Badges */}
        {(topCompleter || biggestChicken) && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {topCompleter && (
              <span
                className="font-[Courier_Prime]"
                style={{ fontSize: 11, color: '#00ff99', border: '1px solid #00ff99', padding: '2px 8px' }}
              >
                🏆 MOST FEARLESS: {topCompleter.member.display_name || topCompleter.member.username}
              </span>
            )}
            {biggestChicken && (
              <span
                className="font-[Courier_Prime]"
                style={{ fontSize: 11, color: '#ff0055', border: '1px solid #ff0055', padding: '2px 8px' }}
              >
                🐔 BIGGEST CHICKEN: {biggestChicken.member.display_name || biggestChicken.member.username}
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="font-[Courier_Prime]" style={{ fontSize: 10, color: '#555048', textAlign: 'left' }}>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid #333' }}>#</th>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid #333' }}>MEMBER</th>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid #333', textAlign: 'center' }}>GIVEN</th>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid #333', textAlign: 'center' }}>RECV</th>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid #333', textAlign: 'center' }}>DONE</th>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid #333', textAlign: 'center' }}>OUT</th>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid #333', textAlign: 'center' }}>RATE</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr
                  key={r.member.id}
                  className="font-[Courier_Prime]"
                  style={{ fontSize: 13, color: '#f0f0f0' }}
                >
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #1a1a1a', color: '#555048' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap' }}>
                    {r.member.display_name || r.member.username}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #1a1a1a', textAlign: 'center', color: '#ffcc00' }}>
                    {r.daresGiven}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #1a1a1a', textAlign: 'center' }}>
                    {r.daresReceived}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #1a1a1a', textAlign: 'center', color: '#00ff99' }}>
                    {r.completed}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #1a1a1a', textAlign: 'center', color: '#ff0055' }}>
                    {r.chickened}
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid #1a1a1a', textAlign: 'center' }}>
                    {r.daresReceived > 0 ? `${Math.round(r.completionRate * 100)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  )
}
