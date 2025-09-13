class PopupManager {
    constructor(app) {
        this.app = app;
    }

    showInfo() {
        const popup = document.getElementById('infoPopup');
        popup.classList.add('show');
    }

    hideInfo() {
        const popup = document.getElementById('infoPopup');
        popup.classList.remove('show');
    }

    showProtocolInfo(protocol) {
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

    hideProtocolInfo() {
        const popup = document.getElementById('protocolPopup');
        popup.classList.remove('show');
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

    showParticipantProfile(participantId) {
        const participant = this.app.participants.get(participantId);
        if (!participant) return;

        const popup = document.getElementById('participantProfilePopup');
        if (!popup) {
            this.createParticipantProfilePopup();
        }
        
        this.populateParticipantProfile(participant);
        document.getElementById('participantProfilePopup').classList.add('show');
    }

    createParticipantProfilePopup() {
        const popupHTML = `
            <div class="popup-overlay" id="participantProfilePopup" onclick="hideParticipantProfile()">
                <div class="popup-content" onclick="event.stopPropagation()">
                    <div class="popup-header">
                        <h3 id="profileTitle">Портфолио участника</h3>
                        <button class="popup-close" onclick="hideParticipantProfile()">×</button>
                    </div>
                    <div class="popup-body" id="profileBody">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    populateParticipantProfile(participant) {
        const title = document.getElementById('profileTitle');
        const body = document.getElementById('profileBody');
        
        title.textContent = `${participant.callsign} - Портфолио`;
        
        const batteryIcon = this.app.getBatteryIcon(participant.status.battery);
        const lastSeenText = this.app.formatLastSeen(participant.status.lastSeen);
        const statusIcon = participant.status.online ? '🟢' : '🔴';
        const favoriteIcon = participant.isFavorite ? '⭐' : '☆';
        
        body.innerHTML = `
            <div class="profile-section">
                <div class="profile-avatar">${participant.avatar}</div>
                <div class="profile-basic">
                    <h3>${participant.callsign} ${favoriteIcon}</h3>
                    <p>${participant.realName || 'Имя не указано'}</p>
                    <p>📞 ${participant.phone}</p>
                </div>
            </div>
            
            <div class="profile-section">
                <h4>📊 Статус</h4>
                <div class="status-grid">
                    <div class="status-item">
                        <span class="status-label">Присутствие:</span>
                        <span class="status-value">${statusIcon} ${participant.status.online ? 'Онлайн' : 'Офлайн'}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Батарея:</span>
                        <span class="status-value">${batteryIcon} ${participant.status.battery}%</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Активность:</span>
                        <span class="status-value">${lastSeenText}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Геолокация:</span>
                        <span class="status-value">📍 ${participant.status.location === 'known' ? 'Известна' : 'Неизвестна'}</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h4>🔗 Протоколы связи</h4>
                <div class="protocols-grid">
                    <div class="protocol-item ${participant.protocols.cellular ? 'active' : 'inactive'}">
                        �� Сотовая связь
                    </div>
                    <div class="protocol-item ${participant.protocols.webrtc ? 'active' : 'inactive'}">
                        🌐 WebRTC
                    </div>
                    <div class="protocol-item ${participant.protocols.local_wifi ? 'active' : 'inactive'}">
                        📶 Локальная сеть
                    </div>
                    <div class="protocol-item ${participant.protocols.zigbee ? 'active' : 'inactive'}">
                        🔗 ZigBee
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h4>⚙️ Настройки</h4>
                <div class="settings-grid">
                    <div class="setting-item">
                        <span class="setting-label">Предпочитаемый протокол:</span>
                        <span class="setting-value">${participant.preferences.preferredProtocol || 'Авто'}</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Тихие часы:</span>
                        <span class="setting-value">${participant.preferences.quietHours ? 
                            `${participant.preferences.quietHours.start} - ${participant.preferences.quietHours.end}` : 
                            'Не установлены'}</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Геолокация:</span>
                        <span class="setting-value">${participant.preferences.allowLocation ? '✅ Разрешена' : '❌ Запрещена'}</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="btn-primary" onclick="makeCallFromProfile('${participant.id}')">📞 Позвонить</button>
                <button class="btn-secondary" onclick="sendMessageFromProfile('${participant.id}')">💬 Сообщение</button>
                <button class="btn-secondary" onclick="toggleFavoriteFromProfile('${participant.id}')">${participant.isFavorite ? '☆ Убрать из избранного' : '⭐ В избранное'}</button>
            </div>
        `;
    }

    hideParticipantProfile() {
        const popup = document.getElementById('participantProfilePopup');
        if (popup) {
            popup.classList.remove('show');
        }
    }
}
