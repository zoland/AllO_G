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

        // Добавляем состояние в историю браузера для кнопки "Назад"
        history.pushState({ profileOpen: true, participantId }, '', '');

        const popup = document.getElementById('participantProfilePopup');
        if (!popup) {
            this.createParticipantProfilePopup();
        }
        
        this.populateParticipantProfile(participant);
        document.getElementById('participantProfilePopup').classList.add('show');
    }

    createParticipantProfilePopup() {
        const popupHTML = `
            <div class="popup-overlay" id="participantProfilePopup">
                <div class="popup-content" onclick="event.stopPropagation()">
                    <div class="popup-header">
                        <button class="back-btn" onclick="goBackFromProfile()" title="Назад">←</button>
                        <h3 id="profileTitle">Портфолио участника</h3>
                        <button class="popup-close" onclick="closeProfileWithConfirm()">×</button>
                    </div>
                    <div class="popup-body" id="profileBody">
                    </div>
                    <div class="popup-footer">
                        <button class="btn-secondary" onclick="goBackFromProfile()">← Назад</button>
                        <button class="btn-primary" onclick="saveProfileChanges()">💾 Сохранить</button>
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
        const blockedStatus = participant.blocked ? '🚫 Заблокирован' : '✅ Активен';
        
        body.innerHTML = `
            <div class="profile-section">
                <div class="profile-avatar">${participant.avatar}</div>
                <div class="profile-basic">
                    <h3>${participant.callsign} ${favoriteIcon}</h3>
                    <p>${participant.realName || 'Имя не указано'}</p>
                    <p>📞 ${participant.phone}</p>
                    <p class="block-status ${participant.blocked ? 'blocked' : 'active'}">${blockedStatus}</p>
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
                        📱 Сотовая связь
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
                        <select id="preferredProtocol" class="setting-input">
                            <option value="cellular" ${participant.preferences.preferredProtocol === 'cellular' ? 'selected' : ''}>Сотовая связь</option>
                            <option value="webrtc" ${participant.preferences.preferredProtocol === 'webrtc' ? 'selected' : ''}>WebRTC</option>
                            <option value="local_wifi" ${participant.preferences.preferredProtocol === 'local_wifi' ? 'selected' : ''}>Локальная сеть</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Тихие часы:</span>
                        <span class="setting-value">${participant.preferences.quietHours ? 
                            `${participant.preferences.quietHours.start} - ${participant.preferences.quietHours.end}` : 
                            'Не установлены'}</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Геолокация:</span>
                        <label class="checkbox-label">
                            <input type="checkbox" id="allowLocation" ${participant.preferences.allowLocation ? 'checked' : ''}>
                            <span class="checkmark">📍</span>
                            Разрешить
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h4>🎯 Быстрые действия</h4>
                <div class="profile-actions">
                    <button class="btn-primary" onclick="makeCallFromProfile('${participant.id}')" ${participant.blocked ? 'disabled' : ''}>📞 Позвонить</button>
                    <button class="btn-secondary" onclick="sendMessageFromProfile('${participant.id}')" ${participant.blocked ? 'disabled' : ''}>💬 Сообщение</button>
                    <button class="btn-secondary" onclick="showLocationFromProfile('${participant.id}')">📍 Местоположение</button>
                </div>
                
                <div class="profile-actions">
                    <button class="btn-secondary" onclick="openHistoryFromProfile('${participant.id}')">📋 История</button>
                    <button class="btn-secondary" onclick="openRolesFromProfile('${participant.id}')">🎭 Роли</button>
                    <button class="btn-secondary" onclick="openCommunicationsFromProfile('${participant.id}')">📞 Связь</button>
                </div>
                
                <div class="profile-actions">
                    <button class="btn-secondary" onclick="toggleFavoriteFromProfile('${participant.id}')">${participant.isFavorite ? '☆ Убрать из избранного' : '⭐ В избранное'}</button>
                    <button class="btn-warning" onclick="toggleBlockFromProfile('${participant.id}')">${participant.blocked ? '✅ Разблокировать' : '🚫 Заблокировать'}</button>
                </div>
            </div>
        `;
    }

    hideParticipantProfile() {
        const popup = document.getElementById('participantProfilePopup');
        if (popup) {
            popup.classList.remove('show');
        }
        
        // Убираем состояние из истории браузера
        if (history.state && history.state.profileOpen) {
            history.back();
        }
    }
}

// Глобальные функции для навигации в портфолио
function goBackFromProfile() {
    app.popupManager.hideParticipantProfile();
}

function closeProfileWithConfirm() {
    // Проверяем есть ли несохраненные изменения
    if (confirm('Закрыть портфолио? Несохраненные изменения будут потеряны.')) {
        app.popupManager.hideParticipantProfile();
    }
}

function saveProfileChanges() {
    // Здесь будет логика сохранения изменений
    const profilePopup = document.getElementById('participantProfilePopup');
    const participantId = history.state?.participantId;
    
    if (participantId) {
        const participant = app.participants.get(participantId);
        if (participant) {
            // Сохраняем изменения настроек
            const preferredProtocol = document.getElementById('preferredProtocol')?.value;
            const allowLocation = document.getElementById('allowLocation')?.checked;
            
            if (preferredProtocol) {
                participant.preferences.preferredProtocol = preferredProtocol;
            }
            if (allowLocation !== undefined) {
                participant.preferences.allowLocation = allowLocation;
            }
            
            app.renderParticipants();
            app.showNotification(`💾 Настройки ${participant.callsign} сохранены`);
        }
    }
    
    app.popupManager.hideParticipantProfile();
}

// Дополнительные функции для портфолио
function toggleBlockFromProfile(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        participant.blocked = !participant.blocked;
        app.renderParticipants();
        app.popupManager.showParticipantProfile(participantId);
        
        const status = participant.blocked ? 'заблокирован' : 'разблокирован';
        app.showNotification(`${participant.blocked ? '🚫' : '✅'} ${participant.callsign} ${status}`);
    }
}

function showLocationFromProfile(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        app.showNotification(`📍 Местоположение ${participant.callsign}: ${participant.status.location}`);
    }
}
