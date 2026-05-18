'use client'

import React from 'react'

export type LeadTimelineActivity = {
  id: string
  action: string
  note?: string | null
  performedBy?: {
    id: string
    name: string
    email: string
  }
  timestamp: string
  user?: {
    id: string
    name: string
    email: string
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

export default function LeadTimeline({ activities }: { activities: LeadTimelineActivity[] }) {
  if (!activities?.length) {
    return (
      <div className="text-center py-6 text-gray-500">
        No activity yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const actor = (a.performedBy || a.user) as any
        return (
          <div key={a.id} className="flex items-start gap-3">
            <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-gray-900">
                  {a.action}
                </div>
                <div className="text-xs text-gray-400">{formatTime(a.timestamp)}</div>
              </div>
              {a.note ? (
                <div className="text-sm text-gray-600 mt-1">
                  {a.note}
                </div>
              ) : null}
              {actor?.name ? (
                <div className="text-xs text-gray-500 mt-1">
                  By {actor.name}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

