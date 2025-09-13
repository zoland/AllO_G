const testParticipants = [
    {
        id: "alpha_001",
        callsign: "🎭 Альфа",
        realName: "Иван Петров",
        phone: "+7999123456",
        avatar: "🎭",
        isFavorite: true,
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
        },
        preferences: {
            preferredProtocol: "webrtc",
            quietHours: { start: "22:00", end: "08:00" },
            allowLocation: true
        }
    },
    {
        id: "bravo_002", 
        callsign: "🎯 Браво",
        realName: "Анна Сидорова",
        phone: "+7988654321",
        avatar: "🎯",
        isFavorite: false,
        status: {
            online: true,
            lastSeen: new Date(Date.now() - 300000).toISOString(),
            battery: 67,
            location: "approximate"
        },
        protocols: {
            cellular: true,
            webrtc: true,
            local_wifi: true,
            zigbee: false
        },
        preferences: {
            preferredProtocol: "local_wifi",
            quietHours: null,
            allowLocation: true
        }
    },
    {
        id: "charlie_003",
        callsign: "🛡️ Чарли", 
        realName: "Михаил Козлов",
        phone: "+7977555444",
        avatar: "🛡️",
        isFavorite: true,
        status: {
            online: false,
            lastSeen: new Date(Date.now() - 1800000).toISOString(),
            battery: 23,
            location: "unknown"
        },
        protocols: {
            cellular: true,
            webrtc: false,
            local_wifi: false,
            zigbee: false
        },
        preferences: {
            preferredProtocol: "cellular",
            quietHours: { start: "23:00", end: "07:00" },
            allowLocation: false
        }
    },
    {
        id: "delta_004",
        callsign: "🔧 Дельта",
        realName: "Елена Морозова", 
        phone: "+7966333222",
        avatar: "🔧",
        isFavorite: false,
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
        },
        preferences: {
            preferredProtocol: "webrtc",
            quietHours: null,
            allowLocation: true
        }
    }
];

const protocolStatus = {
    I: {
        active: true,
        quality: "good",
        type: "4G",
        description: "Мобильный интернет",
        details: "Скорость: хорошая\nТрафик: безлимит\nЗадержка: 50ms"
    },
    W: {
        active: false,
        devices: 0,
        network: "AllO_Local",
        description: "Локальная WiFi сеть",
        details: "Статус: не подключен\nДоступные сети: 0\nРекомендация: подключитесь к WiFi"
    },
    A: {
        active: false,
        clients: 0,
        ssid: "AllO_AP_Alpha",
        description: "Точка доступа",
        details: "Статус: выключена\nКлиенты: 0\nРекомендация: создайте точку доступа для команды"
    },
    Z: {
        active: false,
        mesh: false,
        description: "ZigBee сеть",
        details: "Статус: недоступно\nПоддержка: в разработке\nПланы: mesh-сеть для больших команд"
    }
};

const futureScenes = {
    current: null,
    available: [
        {
            id: "mountain_hike_2024",
            name: "Поход в горы 2024",
            description: "Зимний поход в горы с командой",
            roles: {
                "alpha_001": ["leader", "navigator"],
                "bravo_002": ["medic", "photographer"], 
                "charlie_003": ["security", "cook"],
                "delta_004": ["tech", "equipment"]
            }
        }
    ]
};
