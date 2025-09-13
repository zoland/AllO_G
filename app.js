class AllO_G_Communicator {
    constructor() {
        this.participants = new Map();
        this.selectedParticipant = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 100;
        this.init();
    }

    init() {
        console.log('🚀 AllO_G v1.1.2 Коммуникатор запущен');
        this.loadParticipants();
        this.updateProtocolStatus();
        this.setupEventListeners();
        this.setupSwipeHandlers();
        
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

        const statusClass = participant.status.online ? 'online' : 'offline';
        const batteryIcon = this.getBatteryIcon(participant.status.battery);
        const lastSeenText = this.formatLastSeen(participant.status.lastSeen);
        const favoriteIcon = participant.isFavorite ? '<span class="favorite-star">⭐</span>' : '';

        card.innerHTML = `
            <div class="participant-avatar">${participant.avatar}</div>
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

    setupSwipeHandlers() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
                const target = e.target.closest('.participant-card, .add-participant-card');
                
                if (target) {
                    if (target.id === 'addParticipantCard') {
                        if (deltaX > 0) {
                            this.showQuickContact();
                        } else {
                            this.showCreateParticipant();
                        }
                    } else {
                        const participantId = target.dataset.participantId;
                        if (deltaX > 0) {
                            this.sendMessage(participantId);
                        } else {
                            this.makeCall(participantId);
                        }
                    }
                }
            }

            this.touchStartX = 0;
            this.touchStartY = 0;
        });
    }

    makeCall(participantId) {
        const participant = this.participants.get(participantId);
        if (!participant) return;

        console.log(`📞 Звонок участнику: ${participant.callsign}`);
        
        const protocol = this.getPreferredProtocol(participant);
        
        switch(protocol) {
            case 'webrtc':
                console.log('🌐 WebRTC звонок');
                this.showNotification(`📞 WebRTC звонок ${participant.callsign}`);
                break;
            case 'local_wifi':
                console.log('📶 Локальный звонок');
                this.showNotification(`📶 Локальный звонок ${participant.callsign}`);
                break;
            default:
                console.log('📱 Обычный звонок');
                window.location.href = `tel:${participant.phone}`;
        }
    }

    sendMessage(participantId) {
        const participant = this.participants.get(participantId);
        if (!participant) return;

        console.log(`💬 Сообщение участнику: ${participant.callsign}`);
        
        const protocol = this.getPreferredMessageProtocol(participant);
        
        switch(protocol) {
            case 'local_chat':
                console.log('💬 Локальный чат');
                this.showNotification(`💬 Локальное сообщение ${participant.callsign}`);
                break;
            case 'webrtc_data':
                console.log('🌐 WebRTC сообщение');
                this.showNotification(`🌐 WebRTC сообщение ${participant.callsign}`);
                break;
            default:
                console.log('📱 SMS');
                window.location.href = `sms:${participant.phone}`;
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
        if (battery > 50) return '🔋';
        if (battery > 25) return '��';
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

    showCreateParticipant() {
        const popup = document.getElementById('createParticipantPopup');
        popup.classList.add('show');
        document.getElementById('participantForm').reset();
    }

    hideCreateParticipant() {
        const popup = document.getElementById('createParticipantPopup');
        popup.classList.remove('show');
    }

    showQuickContact() {
        const popup = document.getElementById('quickContactPopup');
        popup.classList.add('show');
    }

    hideQuickContact() {
        const popup = document.getElementById('quickContactPopup');
        popup.classList.remove('show');
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
        this.hideCreateParticipant();
        this.showNotification(`✅ Участник ${callsign} добавлен`);
        
        console.log('👤 Новый участник создан:', newParticipant);
    }
}

function showInfo() {
    const popup = document.getElementById('infoPopup');
    popup.classList.add('show');
}

function hideInfo() {
    const popup = document.getElementById('infoPopup');
    popup.classList.remove('show');
}

function showProtocolInfo(protocol) {
    const popup = document.getElementById('protocolPopup');
    const title = document.getElementById('protocolTitle');
    const info = document.getElementById('protocolInfo');
    
    const status = protocolStatus[protocol];
    const protocolNames = {
        I: 'Интернет',
        W: 'WiFi локальная сеть',
        A: 'Точка доступа', 
        Z: 'ZigBee сеть'
    };
    
    title.textContent = protocolNames[protocol];
    info.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>${status.description}</strong>
        </div>
        <div style="white-space: pre-line; font-size: 0.9rem; color: rgba(255,255,255,0.8);">
            ${status.details}
        </div>
    `;
    
    popup.classList.add('show');
}

function hideProtocolInfo() {
    const popup = document.getElementById('protocolPopup');
    popup.classList.remove('show');
}

function showParticipantMenu(event, participantId) {
    event.stopPropagation();
    
    const menu = document.getElementById('participantMenu');
    const rect = event.target.getBoundingClientRect();
    
    menu.style.left = `${Math.min(rect.left - 150, window.innerWidth - 200)}px`;
    menu.style.top = `${rect.bottom + 5}px`;
    menu.classList.add('show');
    
    menu.dataset.participantId = participantId;
}

function viewParticipantProfile() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    console.log(`👤 Портфолио участника: ${participantId}`);
    app.showNotification('👤 Портфолио участника (в разработке)');
    app.hideContextMenu();
}

function toggleFavorite() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    const participant = app.participants.get(participantId);
    
    if (participant) {
        participant.isFavorite = !participant.isFavorite;
        app.renderParticipants();
        
        const status = participant.isFavorite ? 'добавлен в избранное' : 'удален из избранного';
        app.showNotification(`⭐ ${participant.callsign} ${status}`);
        
        console.log(`⭐ Избранное изменено для ${participant.callsign}: ${participant.isFavorite}`);
    }
    
    app.hideContextMenu();
}

function viewHistory() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    console.log(`📋 История участника: ${participantId}`);
    app.showNotification('📋 История связи (в разработке)');
    app.hideContextMenu();
}

function removeParticipant() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    const participant = app.participants.get(participantId);
    
    if (participant && confirm(`Удалить ${participant.callsign} из списка?`)) {
        app.participants.delete(participantId);
        app.renderParticipants();
        app.showNotification(`🗑️ ${participant.callsign} удален`);
        console.log(`🗑️ Участник удален: ${participantId}`);
    }
    
    app.hideContextMenu();
}

function openDialer() {
    console.log('📞 Связь');
    app.showNotification('📞 Функции связи (в разработке)');
}

function openGroupActions() {
    console.log('👥 Группа');
    app.showNotification('👥 Групповые действия (в разработке)');
}

function openMap() {
    console.log('📍 Карта');
    app.showNotification('📍 Карта участников (в разработке)');
}

function openVoiceCommands() {
    console.log('🎤 Голосовые команды');
    app.showNotification('🎤 Голосовые команды (в разработке)');
}

function openHelp() {
    console.log('❓ Справка');
    app.showNotification('❓ Справочная система (в разработке)');
}

function openSettings() {
    console.log('⚙️ Настройки');
    app.showNotification('⚙️ Настройки (в разработке)');
}

function openIncognitoCall() {
    console.log('📞 Инкогнито звонок');
    app.hideQuickContact();
    
    const number = prompt('Введите номер телефона:');
    if (number) {
        window.location.href = `tel:${number}`;
    }
}

function openCallsignSearch() {
    console.log('📢 Поиск по позывному');
    app.hideQuickContact();
    
    const callsign = prompt('Введите позывной для поиска:');
    if (callsign) {
        app.showNotification(`🔍 Поиск "${callsign}" в сетях...`);
    }
}

function searchInNetwork() {
    console.log('🔍 Поиск в сети');
    app.hideQuickContact();
    app.showNotification('🔍 Поиск участников в локальной сети...');
}

function saveParticipant(event) {
    app.saveParticipant(event);
}

function hideCreateParticipant() {
    app.hideCreateParticipant();
}

function hideQuickContact() {
    app.hideQuickContact();
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AllO_G_Communicator();
});
