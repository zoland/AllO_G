// AllO_G Коммуникатор - Основная логика
class AllO_G_Communicator {
    constructor() {
        this.participants = new Map();
        this.selectedParticipant = null;
        this.init();
    }

    init() {
        console.log('🚀 AllO_G Коммуникатор запущен');
        this.loadParticipants();
        this.updateProtocolStatus();
        this.setupEventListeners();
    }

    loadParticipants() {
        testParticipants.forEach(participant => {
            this.participants.set(participant.id, participant);
        });
        this.renderParticipants();
    }

    renderParticipants() {
        const container = document.getElementById('participantsList');
        container.innerHTML = '';

        this.participants.forEach(participant => {
            const card = this.createParticipantCard(participant);
            container.appendChild(card);
        });
    }

    createParticipantCard(participant) {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.dataset.participantId = participant.id;

        const statusClass = participant.status.online ? 'online' : 'offline';
        const batteryIcon = this.getBatteryIcon(participant.status.battery);
        const lastSeenText = this.formatLastSeen(participant.status.lastSeen);

        card.innerHTML = `
            <div class="participant-avatar">${participant.avatar}</div>
            <div class="participant-info">
                <div class="participant-name">${participant.callsign}</div>
                <div class="participant-details">
                    <span>${batteryIcon}${participant.status.battery}%</span>
                    <span>•</span>
                    <span>${lastSeenText}</span>
                </div>
            </div>
            <div class="participant-actions">
                <div class="quick-action call" onclick="makeCall('${participant.id}')" title="Позвонить">
                    📞
                </div>
                <div class="quick-action message" onclick="sendMessage('${participant.id}')" title="Сообщение">
                    💬
                </div>
                <div class="quick-action" onclick="showLocation('${participant.id}')" title="Местоположение">
                    📍
                </div>
                <div class="status-indicator ${statusClass}"></div>
            </div>
            <div class="participant-menu" onclick="showParticipantMenu(event, '${participant.id}')">
                <div class="menu-dots">
                    <div class="menu-dot"></div>
                    <div class="menu-dot"></div>
                    <div class="menu-dot"></div>
                </div>
            </div>
        `;

        return card;
    }

    updateProtocolStatus() {
        Object.keys(protocolStatus).forEach(protocol => {
            const element = document.getElementById(`protocol-${protocol}`);
            const status = protocolStatus[protocol];
            
            element.className = 'protocol';
            if (status.active) {
                if (status.quality === 'good') {
                    element.classList.add('active');
                } else {
                    element.classList.add('poor');
                }
            } else {
                element.classList.add('offline');
            }
            
            element.title = this.getProtocolTooltip(protocol, status);
        });
    }

    getProtocolTooltip(protocol, status) {
        const names = {
            I: 'Интернет',
            W: 'WiFi локальная сеть', 
            A: 'Точка доступа',
            Z: 'ZigBee сеть'
        };

        if (!status.active) {
            return `${names[protocol]}: Недоступен`;
        }

        switch(protocol) {
            case 'I':
                return `${names[protocol]}: ${status.type}, ${status.quality}`;
            case 'W':
                return `${names[protocol]}: ${status.devices} устройств`;
            case 'A':
                return `${names[protocol]}: ${status.clients} клиентов`;
            case 'Z':
                return `${names[protocol]}: ${status.mesh ? 'Mesh активна' : 'Прямое соединение'}`;
            default:
                return names[protocol];
        }
    }

    getBatteryIcon(battery) {
        if (battery > 75) return '🔋';
        if (battery > 50) return '🔋';
        if (battery > 25) return '🪫';
        return '🪫';
    }

    formatLastSeen(lastSeen) {
        const now = new Date();
        const seen = new Date(lastSeen);
        const diffMs = now - seen;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'сейчас';
        if (diffMins < 60) return `${diffMins}м назад`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}ч назад`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}д назад`;
    }

    setupEventListeners() {
        // Закрытие контекстного меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Обновление статуса каждые 30 секунд
        setInterval(() => {
            this.updateProtocolStatus();
            this.renderParticipants();
        }, 30000);
    }

    hideContextMenu() {
        const menu = document.getElementById('participantMenu');
        menu.classList.remove('show');
    }
}

// Глобальные функции для UI
function showInfo() {
    const popup = document.getElementById('infoPopup');
    popup.classList.add('show');
}

function hideInfo() {
    const popup = document.getElementById('infoPopup');
    popup.classList.remove('show');
}

function showParticipantMenu(event, participantId) {
    event.stopPropagation();
    
    const menu = document.getElementById('participantMenu');
    const rect = event.target.getBoundingClientRect();
    
    menu.style.left = `${rect.left - 150}px`;
    menu.style.top = `${rect.bottom + 5}px`;
    menu.classList.add('show');
    
    // Сохраняем ID выбранного участника
    menu.dataset.participantId = participantId;
}

function makeCall(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        console.log(`📞 Звонок участнику: ${participant.callsign}`);
        // Здесь будет логика выбора протокола и звонка
        window.location.href = `tel:${participant.phone}`;
    }
}

function sendMessage(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        console.log(`💬 Сообщение участнику: ${participant.callsign}`);
        // Здесь будет логика отправки сообщения
        window.location.href = `sms:${participant.phone}`;
    }
}

function showLocation(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        console.log(`📍 Местоположение участника: ${participant.callsign}`);
        alert(`Местоположение ${participant.callsign}: ${participant.status.location}`);
    }
}

// Функции нижней панели
function openDialer() {
    console.log('📞 Открываем номеронабиратель');
    alert('Номеронабиратель (в разработке)');
}

function openSearch() {
    console.log('🔍 Открываем поиск');
    alert('Поиск участников (в разработке)');
}

function startGroupCall() {
    console.log('📞👥 Групповой вызов');
    alert('Групповой вызов (в разработке)');
}

function sendBroadcast() {
    console.log('📢 Рассылка');
    alert('Рассылка сообщений (в разработке)');
}

function openAnalytics() {
    console.log('📊 Статистика');
    alert('Статистика и аналитика (в разработке)');
}

function openSettings() {
    console.log('⚙️ Настройки');
    alert('Настройки приложения (в разработке)');
}

// Функции контекстного меню
function editParticipant() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    console.log(`✏️ Редактирование участника: ${participantId}`);
    alert('Редактирование участника (в разработке)');
    app.hideContextMenu();
}

function configureParticipant() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    console.log(`⚙️ Настройка участника: ${participantId}`);
    alert('Настройка участника (в разработке)');
    app.hideContextMenu();
}

function viewHistory() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    console.log(`📋 История участника: ${participantId}`);
    alert('История связи (в разработке)');
    app.hideContextMenu();
}

function removeParticipant() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    
    if (confirm('Удалить участника из списка?')) {
        app.participants.delete(participantId);
        app.renderParticipants();
        console.log(`🗑️ Участник удален: ${participantId}`);
    }
    
    app.hideContextMenu();
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AllO_G_Communicator();
});
