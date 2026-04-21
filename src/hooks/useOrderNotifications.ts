'use client'

import { useCallback, useEffect, useState } from 'react'
import { useOrderSound, UseOrderSoundOptions } from './useOrderSound'
import { useNewOrderDetector, UseNewOrderDetectorOptions } from './useNewOrderDetector'
import { toast } from 'sonner'

export interface UseOrderNotificationsOptions {
    sound?: UseOrderSoundOptions
    detector?: Omit<UseNewOrderDetectorOptions, 'onNewOrder'>
    enableBrowserNotifications?: boolean
    onNewOrder?: (order: any) => void
}

export interface UseOrderNotificationsReturn {
    isSoundEnabled: boolean
    toggleSound: () => void
    enableSound: () => void
    disableSound: () => void
    playSound: () => Promise<void>
    isBrowserNotificationEnabled: boolean
    requestBrowserNotificationPermission: () => Promise<NotificationPermission>
    latestOrder: any
    isDetecting: boolean
}

export function useOrderNotifications(options: UseOrderNotificationsOptions = {}): UseOrderNotificationsReturn {
    const { 
        sound = {}, 
        detector = {},
        enableBrowserNotifications = false,
        onNewOrder 
    } = options

    const [isBrowserNotificationEnabled, setIsBrowserNotificationEnabled] = useState(false)

    const soundHook = useOrderSound({
        enabled: sound.enabled ?? true,
        volume: sound.volume ?? 0.7,
        onSoundEnabled: sound.onSoundEnabled,
        onSoundDisabled: sound.onSoundDisabled
    })

    const handleNewOrder = useCallback(async (order: any) => {
        await soundHook.playSound()
        
        if (enableBrowserNotifications && isBrowserNotificationEnabled) {
            showBrowserNotification(order)
        }

        toast.success(`🔔 Novo pedido #${order.orderNumber || order.id.slice(-4)}!`, {
            description: `${order.customerName || 'Cliente'} - ${order.orderType === 'DINE_IN' ? 'Mesa ' + order.tableNumber : order.orderType === 'DELIVERY' ? 'Delivery' : 'Retirada'}`,
            duration: 5000
        })

        onNewOrder?.(order)
    }, [soundHook, enableBrowserNotifications, isBrowserNotificationEnabled, onNewOrder])

    const detectorHook = useNewOrderDetector({
        ...detector,
        onNewOrder: handleNewOrder
    })

    const showBrowserNotification = (order: any) => {
        if (typeof window === 'undefined' || !('Notification' in window)) return

        const notification = new Notification('Novo Pedido!', {
            body: `Pedido #${order.orderNumber || order.id.slice(-4)} - ${order.customerName || 'Cliente'}`,
            icon: '/icons/notification-icon.png',
            tag: `order-${order.id}`,
            requireInteraction: true
        })

        notification.onclick = () => {
            window.focus()
            notification.close()
        }
    }

    const requestBrowserNotificationPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return 'denied' as NotificationPermission
        }

        if (Notification.permission === 'granted') {
            setIsBrowserNotificationEnabled(true)
            return 'granted'
        }

        if (Notification.permission === 'denied') {
            return 'denied'
        }

        const permission = await Notification.requestPermission()
        setIsBrowserNotificationEnabled(permission === 'granted')
        return permission
    }, [])

    useEffect(() => {
        if (enableBrowserNotifications && typeof window !== 'undefined' && 'Notification' in window) {
            setIsBrowserNotificationEnabled(Notification.permission === 'granted')
        }
    }, [enableBrowserNotifications])

    return {
        isSoundEnabled: soundHook.isEnabled,
        toggleSound: soundHook.toggleSound,
        enableSound: soundHook.enableSound,
        disableSound: soundHook.disableSound,
        playSound: soundHook.playSound,
        isBrowserNotificationEnabled,
        requestBrowserNotificationPermission,
        latestOrder: detectorHook.latestOrder,
        isDetecting: detectorHook.isDetecting
    }
}