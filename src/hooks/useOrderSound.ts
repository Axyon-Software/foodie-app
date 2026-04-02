'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseOrderSoundOptions {
    enabled?: boolean
    volume?: number
    onSoundEnabled?: () => void
    onSoundDisabled?: () => void
}

export interface UseOrderSoundReturn {
    isEnabled: boolean
    toggleSound: () => void
    enableSound: () => void
    disableSound: () => void
    playSound: () => Promise<void>
    volume: number
    setVolume: (volume: number) => void
}

export function useOrderSound(options: UseOrderSoundOptions = {}): UseOrderSoundReturn {
    const { 
        enabled = true, 
        volume: initialVolume = 0.7,
        onSoundEnabled,
        onSoundDisabled 
    } = options

    const [isEnabled, setIsEnabled] = useState(enabled)
    const [volume, setVolumeState] = useState(initialVolume)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const hasPlayedRef = useRef(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/new-order.mp3')
            audioRef.current.preload = 'auto'
            
            audioRef.current.addEventListener('error', () => {
                audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
                audioRef.current!.preload = 'auto'
            })
        }
    }, [])

    const playSound = useCallback(async () => {
        if (!isEnabled || !audioRef.current) return

        try {
            audioRef.current.currentTime = 0
            audioRef.current.volume = volume
            await audioRef.current.play()
        } catch (error) {
            console.error('Erro ao reproduzir som:', error)
        }
    }, [isEnabled, volume])

    const toggleSound = useCallback(() => {
        setIsEnabled(prev => {
            const newValue = !prev
            if (newValue && onSoundEnabled) {
                onSoundEnabled()
            } else if (!newValue && onSoundDisabled) {
                onSoundDisabled()
            }
            return newValue
        })
    }, [onSoundEnabled, onSoundDisabled])

    const enableSound = useCallback(() => {
        setIsEnabled(true)
        onSoundEnabled?.()
    }, [onSoundEnabled])

    const disableSound = useCallback(() => {
        setIsEnabled(false)
        onSoundDisabled?.()
    }, [onSoundDisabled])

    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume))
        setVolumeState(clampedVolume)
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume
        }
    }, [])

    return {
        isEnabled,
        toggleSound,
        enableSound,
        disableSound,
        playSound,
        volume,
        setVolume
    }
}