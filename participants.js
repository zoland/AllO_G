// Тестовые участники из основного проекта AllO
const testParticipants = [
    {
        id: "alpha_001",
        callsign: "🎭 Альфа",
        role: "coordinator",
        realName: "Иван Петров",
        phone: "+7999123456",
        avatar: "🎭",
        status: {
            online: true,
            lastSeen: new Date().toISOString(),
            battery: 85,
            location: "known"
        },
        protocols: {
            cellular: true,
            webrtc: true,
            local_wifi: false,
            zigbee: false
        }
    },
    {
        id: "bravo_002", 
        callsign: "🎯 Браво",
        role: "scout",
        realName: "Анна Сидорова",
        phone: "+7988654321",
        avatar: "🎯",
        status: {
            online: true,
            lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 минут назад
            battery: 67,
            location: "approximate"
        },
        protocols: {
            cellular: true,
            webrtc: true,
            local_wifi: true,
            zigbee: false
        }
    },
    {
        id: "charlie_003",
        callsign: "🛡️ Чарли", 
        role: "security",
        realName: "Михаил Козлов",
        phone: "+7977555444",
        avatar: "🛡️",
        status: {
            online: false,
            lastSeen: new Date(Date.now() - 1800000).toISOString(), // 30 минут назад
            battery: 23,
            location: "unknown"
        },
        protocols: {
            cellular: true,
            webrtc: false,
            local_wifi: false,
            zigbee: false
        }
    },
    {
        id: "delta_004",
        callsign: "🔧 Дельта",
        role: "tech",
        realName: "Елена Морозова", 
        phone: "+7966333222",
        avatar: "🔧",
        status: {
            online: true,
            lastSeen: new Date().toISOString(),
            battery: 92,
            location: "known"
        },
        protocols: {
            cellular: true,
            webrtc: true,
            local_wifi: true,
            zigbee: true
        }
    }
];

// Состояние протоколов
const protocolStatus = {
    I: { // Internet
        active: true,
        quality: "good",
        type: "4G",
        icon: "🌐"
    },
    W: { // WiFi Local
        active: false,
        devices: 0,
        network: "AllO_Local",
        icon: "📶"
    },
    A: { // Access Point
        active: false,
        clients: 0,
        ssid: "AllO_AP_Alpha",
        icon: "📡"
    },
    Z: { // ZigBee
        active: false,
        mesh: false,
        icon: "🔗"
    }
};
