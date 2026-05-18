'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const useSocket = (userId?: string) => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to socket server')
      socket.emit('join-user', userId)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
    })

    return () => {
      socket.disconnect()
    }
  }, [userId])

  return socketRef.current
}
