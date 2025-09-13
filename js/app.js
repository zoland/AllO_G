class AllO_G_Communicator {
    constructor() {
        this.participants = new Map();
        this.selectedParticipant = null;
        this.popupManager = new PopupManager(this);
        this.swipeManager = new SwipeManager(this);
        this.init();
    }

    init() {
        console.log('🚀 AllO_G v1.1.5 Коммуникатор запущен');
        this.loadParticipants();
        this.updateProtocolStatus();
        this.setupEventListeners();
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
            });
        }
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

        const sortedParticipants = Array.from(this.participants.values()).sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return a.callsign.localeCompare(b.callsign);
        });

        sortedParticipants.forEach(participant => {
            const card = this.createParticipantCard(participant);
            container.appendChild(card);
        });

        const addCard = this.createAddParticipantCard();
        container.appendChild(addCard);
    }

    createParticipantCard(participant) {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.dataset.participantId = participant.id;

        const batteryIcon = this.getBatteryIcon(participant.status.battery);
        const lastSeenText = this.formatLastSeen(participant.status.lastSeen);
        const favoriteIcon = participant.isFavorite ? '<span class="favorite-star">⭐</span>' : '';
        const blockedOverlay = participant.blocked ? '<div class="blocked-overlay">🚫</div>' : '';

        card.innerHTML = `
            ${blockedOverlay}
            <div class="participant-header" onclick="openParticipantProfile('${participant.id}')">
                <div class="participant-avatar ${participant.blocked ? 'blocked' : ''}">${participant.avatar}</div>
                <div class="participant-info">
                    <div class="participant-name">
                        ${favoriteIcon}${participant.callsign}
                    </div>
                    <div class="participant-details">
                        <span>${participant.realName || 'Участник'}</span>
                        <span>•</span>
                        <span>${batteryIcon}${participant.status.battery}%</span>
                        <span>•</span>
                        <span>${lastSeenText}</span>
                    </div>
                </div>
                <div class="participant-menu" onclick="showParticipantMenu(event, '${participant.id}')">
                    <div class="menu-dots">
                        <div class="menu-dot"></div>
                        <div class="menu-dot"></div>
                        <div class="menu-dot"></div>
                    </div>
                </div>
            </div>
            <div class="participant-actions">
                <div class="action-icon ${participant.blocked ? 'disabled' : ''}" onclick="makeCall('${participant.id}')" title="Позвонить">📞</div>
                <div class="action-icon ${participant.blocked ? 'disabled' : ''}" onclick="sendMessage('${participant.id}')" title="Сообщение">💬</div>
                <div class="action-icon" onclick="showLocation('${participant.id}')" title="Местоположение">📍</div>
                <div class="action-icon" onclick="viewHistory('${participant.id}')" title="История">📋</div>
                <div class="action-icon ${participant.isFavorite ? 'active' : ''}" onclick="toggleFavoriteQuick('${participant.id}')" title="Избранное">${participant.isFavorite ? '⭐' : '☆'}</div>
                <div class="action-icon ${participant.blocked ? 'active' : ''}" onclick="toggleBlockQuick('${participant.id}')" title="Блокировка">${participant.blocked ? '🚫' : '🔓'}</div>
            </div>
        `;

        return card;
    }

    createAddParticipantCard() {
        const card = document.createElement('div');
        card.className = 'add-participant-card';
        card.id = 'addParticipantCard';

        card.innerHTML = `
            <div class="add-participant-title">➕ Добавить участника</div>
            <div class="add-participant-hints">
                Свайп влево: Создать портфолио<br>
                Свайп вправо: Оперативная связь
            </div>
        `;

        return card;
    }

    makeCall(participantId) {
        const participant = this.participants.get(participantId);
        if (!participant) return;

        if (participant.blocked) {
            this.showNotification(`🚫 ${participant.callsign} заблокирован`);
            return;
        }

        console.log(`📞 Звонок участнику: ${participant.callsign}`);
        
        const protocol = this.getPreferredProtocol(participant);
        
        switch(protocol) {
            case 'webrtc':
                this.showNotification(`📞 WebRTC звонок ${participant.callsign}`);
                break;
            case 'local_wifi':
                this.showNotification(`📶 Локальный звонок ${participant.callsign}`);
                break;
            default:
                window.location.href = `tel:${participant.phone}`;
        }
    }

    sendMessage(participantId) {
        const participant = this.participants.get(participantId);
        if (!participant) return;

        if (participant.blocked) {
            this.showNotification(`🚫 ${participant.callsign} заблокирован`);
            return;
        }

        console.log(`💬 Сообщение участнику: ${participant.callsign}`);
        
        const protocol = this.getPreferredMessageProtocol(participant);
        
        switch(protocol) {
            case 'local_chat':
                this.showNotification(`💬 Локальное сообщение ${participant.callsign}`);
                break;
            case 'webrtc_data':
                this.showNotification(`🌐 WebRTC сообщение ${participant.callsign}`);
                break;
            default:
                window.location.href = `sms:${participant.phone}`;
        }
    }

    showLocation(participantId) {
        const participant = this.participants.get(participantId);
        if (participant) {
            this.showNotification(`📍 Местоположение ${participant.callsign}: ${participant.status.location}`);
        }
    }

    viewHistory(participantId) {
        const participant = this.participants.get(participantId);
        if (participant) {
            this.showNotification(`📋 История связи с ${participant.callsign} (в разработке)`);
        }
    }

    toggleFavoriteQuick(participantId) {
        const participant = this.participants.get(participantId);
        if (participant) {
            participant.isFavorite = !participant.isFavorite;
            this.renderParticipants();
            
            const status = participant.isFavorite ? 'добавлен в избранное' : 'удален из избранного';
            this.showNotification(`⭐ ${participant.callsign} ${status}`);
        }
    }

    toggleBlockQuick(participantId) {
        const participant = this.participants.get(participantId);
        if (participant) {
            participant.blocked = !participant.blocked;
            this.renderParticipants();
            
            const status = participant.blocked ? 'заблокирован' : 'разблокирован';
            this.showNotification(`${participant.blocked ? '🚫' : '✅'} ${participant.callsign} ${status}`);
        }
    }

    getPreferredProtocol(participant) {
        const preference = participant.preferences?.preferredProtocol;
        const available = this.getAvailableProtocols();
        
        if (preference && available.includes(preference)) {
            return preference;
        }
        
        const priority = ['local_wifi', 'webrtc', 'cellular'];
        return priority.find(p => available.includes(p)) || 'cellular';
    }

    getPreferredMessageProtocol(participant) {
        const available = this.getAvailableProtocols();
        const priority = ['local_chat', 'webrtc_data', 'sms'];
        return priority.find(p => available.includes(p)) || 'sms';
    }

    getAvailableProtocols() {
        const available = ['cellular', 'sms'];
        
        if (protocolStatus.I.active) {
            available.push('webrtc', 'webrtc_data');
        }
        if (protocolStatus.W.active) {
            available.push('local_wifi', 'local_chat');
        }
        
        return available;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 2000;
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    updateProtocolStatus() {
        Object.keys(protocolStatus).forEach(protocol => {
            const letterElement = document.getElementById(`protocol-${protocol}`);
            const statusElement = document.getElementById(`status-${protocol}`);
            const status = protocolStatus[protocol];
            
            if (letterElement && statusElement) {
                if (status.active) {
                    letterElement.style.color = '#4CAF50';
                    switch(protocol) {
                        case 'I':
                            statusElement.textContent = `🟢${status.type}`;
                            break;
                        case 'W':
                            statusElement.textContent = `🟢${status.devices}`;
                            break;
                        case 'A':
                            statusElement.textContent = `🟢${status.clients}`;
                            break;
                        case 'Z':
                            statusElement.textContent = `🟢ON`;
                            break;
                    }
                } else {
                    letterElement.style.color = 'rgba(255, 255, 255, 0.5)';
                    statusElement.textContent = '⚫';
                }
            }
        });
    }

    getBatteryIcon(battery) {
        if (battery > 75) return '🔋';
        if (battery > 50) return '��';
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
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Обработка кнопки "Назад" для закрытия портфолио
        window.addEventListener('popstate', (e) => {
            const profilePopup = document.getElementById('participantProfilePopup');
            if (profilePopup && profilePopup.classList.contains('show')) {
                this.popupManager.hideParticipantProfile();
                e.preventDefault();
            }
        });

        setInterval(() => {
            this.updateProtocolStatus();
        }, 30000);
    }

    hideContextMenu() {
        const menu = document.getElementById('participantMenu');
        if (menu) {
            menu.classList.remove('show');
        }
    }

    saveParticipant(event) {
        event.preventDefault();
        
        const callsign = document.getElementById('callsign').value;
        const realName = document.getElementById('realName').value;
        const phone = document.getElementById('phoneNumber').value;
        const isFavorite = document.getElementById('isFavorite').checked;
        
        const newParticipant = {
            id: `custom_${Date.now()}`,
            callsign: callsign,
            realName: realName,
            phone: phone,
            avatar: '👤',
            isFavorite: isFavorite,
            blocked: false,
            status: {
                online: false,
                lastSeen: new Date().toISOString(),
                battery: 100,
                location: 'unknown'
            },
            protocols: {
                cellular: true,
                webrtc: false,
                local_wifi: false,
                zigbee: false
            },
            preferences: {
                preferredProtocol: 'cellular',
                quietHours: null,
                allowLocation: true
            }
        };
        
        this.participants.set(newParticipant.id, newParticipant);
        this.renderParticipants();
        this.popupManager.hideCreateParticipant();
        this.showNotification(`✅ Участник ${callsign} добавлен`);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AllO_G_Communicator();
});
