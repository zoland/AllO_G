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
this.setupProfileCloseHandler();    }

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
            <div class="participant-header" onclick="app.showParticipantProfileWithFooter('${participant.id}')">
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
                <div class="action-icon ${participant.blocked ? 'disabled' : ''}" onclick="app.sendMessage('${participant.id}')" title="Сообщение">💬</div>
                <div class="action-icon" onclick="app.showLocation('${participant.id}')" title="Местоположение">��</div>
                <div class="action-icon" onclick="app.viewHistory('${participant.id}')" title="История">📋</div>
                <div class="action-icon ${participant.isFavorite ? 'active' : ''}" onclick="app.toggleFavoriteQuick('${participant.id}')" title="Избранное">${participant.isFavorite ? '⭐' : '☆'}</div>
                <div class="action-icon ${participant.blocked ? 'active' : ''}" onclick="app.toggleBlockQuick('${participant.id}')" title="Блокировка">${participant.blocked ? '🚫' : '🔓'}</div>
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
        window.location.href = `tel:${participant.phone}`;
    }

    sendMessage(participantId) {
        const participant = this.participants.get(participantId);
        if (!participant) return;

        if (participant.blocked) {
            this.showNotification(`🚫 ${participant.callsign} заблокирован`);
            return;
        }

        console.log(`💬 Сообщение участнику: ${participant.callsign}`);
        window.location.href = `sms:${participant.phone}`;
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
            this.showNotification(`�� История связи с ${participant.callsign} (в разработке)`);
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
            this.showNotification(`${participant.blocked ? '��' : '✅'} ${participant.callsign} ${status}`);
        }
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
                            statusElement.textContent = `��ON`;
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
        this.hideCreateParticipant();
        this.showNotification(`✅ Участник ${callsign} добавлен`);
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
        const participant = this.participants.get(participantId);
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
        
        const batteryIcon = this.getBatteryIcon(participant.status.battery);
        const lastSeenText = this.formatLastSeen(participant.status.lastSeen);
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
            
            <div class="profile-actions">
                <button class="btn-primary" onclick="app.makeCall('${participant.id}')" ${participant.blocked ? 'disabled' : ''}>📞 Позвонить</button>
                <button class="btn-secondary" onclick="app.sendMessage('${participant.id}')" ${participant.blocked ? 'disabled' : ''}>💬 Сообщение</button>
                <button class="btn-secondary" onclick="app.showLocation('${participant.id}')">📍 Местоположение</button>
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


class SwipeManager {
    constructor(app) {
        this.app = app;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 100;
        this.setupSwipeHandlers();
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
                            this.app.showQuickContact();
                        } else {
                            this.app.showCreateParticipant();
                        }
                    } else {
                        const participantId = target.dataset.participantId;
                        if (deltaX > 0) {
                            this.app.sendMessage(participantId);
                        } else {
                            this.app.makeCall(participantId);
                        }
                    }
                }
            }

            this.touchStartX = 0;
            this.touchStartY = 0;
        });
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

function openParticipantProfile(participantId) {
    app.showParticipantProfileWithFooter(participantId);
}

function viewHistory() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    const participant = app.participants.get(participantId);
    
    if (participant) {
        app.showNotification(`📋 История связи с ${participant.callsign} (в разработке)`);
    }
    app.hideContextMenu();
}

function manageRoles() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    const participant = app.participants.get(participantId);
    
    if (participant) {
        app.showNotification(`🎭 Управление ролями ${participant.callsign} (в разработке)`);
    }
    app.hideContextMenu();
}

function manageCommunications() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    const participant = app.participants.get(participantId);
    
    if (participant) {
        app.showNotification(`📞 Настройки связи с ${participant.callsign} (в разработке)`);
    }
    app.hideContextMenu();
}

function toggleParticipantBlock() {
    const menu = document.getElementById('participantMenu');
    const participantId = menu.dataset.participantId;
    const participant = app.participants.get(participantId);
    
    if (participant) {
        participant.blocked = !participant.blocked;
        const status = participant.blocked ? 'заблокирован' : 'разблокирован';
        app.showNotification(`🚫 ${participant.callsign} ${status}`);
        app.renderParticipants();
    }
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
    }
    
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
    }
    
    app.hideContextMenu();
}

function openDialer() {
    app.showNotification('📞 Функции связи (в разработке)');
}

function openGroupActions() {
    app.showNotification('👥 Групповые действия (в разработке)');
}

function openMap() {
    app.showNotification('📍 Карта участников (в разработке)');
}

function openVoiceCommands() {
    app.showNotification('🎤 Голосовые команды (в разработке)');
}

function openHelp() {
    app.showNotification('❓ Справочная система (в разработке)');
}

function openSettings() {
    app.showNotification('⚙️ Настройки (в разработке)');
}

function openIncognitoCall() {
    app.hideQuickContact();
    
    const number = prompt('Введите номер телефона:');
    if (number) {
        window.location.href = `tel:${number}`;
    }
}

function openCallsignSearch() {
    app.hideQuickContact();
    
    const callsign = prompt('Введите позывной для поиска:');
    if (callsign) {
        app.showNotification(`🔍 Поиск "${callsign}" в сетях...`);
    }
}

function searchInNetwork() {
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

function hideParticipantProfile() {
    app.hideParticipantProfileAndRestoreFooter();
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AllO_G_Communicator();
});

    showLocation(participantId) {
        const participant = this.participants.get(participantId);
        if (participant) {
            this.showNotification(`📍 Местоположение ${participant.callsign}: ${participant.status.location}`);
        }
    }

    viewHistory(participantId) {
        const participant = this.participants.get(participantId);
        if (participant) {
            this.showNotification(`�� История связи с ${participant.callsign} (в разработке)`);
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
            this.showNotification(`${participant.blocked ? '��' : '✅'} ${participant.callsign} ${status}`);
        }
    }

    showParticipantProfileWithFooter(participantId) {
        const participant = this.participants.get(participantId);
        if (!participant) return;

        this.showParticipantProfile(participantId);
        
        // Заменяем футер на действия участника
        const footer = document.getElementById('actionsSection');
        footer.innerHTML = `
            <div class="action-btn ${participant.blocked ? 'disabled' : ''}" onclick="app.makeCall('${participantId}')">
                <div class="action-icon-footer">📞</div>
                <div class="action-label">Позвонить</div>
            </div>
            <div class="action-btn ${participant.blocked ? 'disabled' : ''}" onclick="app.sendMessage('${participantId}')">
                <div class="action-icon-footer">💬</div>
                <div class="action-label">Сообщение</div>
            </div>
            <div class="action-btn" onclick="app.showLocation('${participantId}')">
                <div class="action-icon-footer">📍</div>
                <div class="action-label">Местоположение</div>
            </div>
            <div class="action-btn" onclick="app.viewHistory('${participantId}')">
                <div class="action-icon-footer">📋</div>
                <div class="action-label">История</div>
            </div>
            <div class="action-btn" onclick="app.toggleFavoriteQuick('${participantId}')">
                <div class="action-icon-footer">${participant.isFavorite ? '⭐' : '☆'}</div>
                <div class="action-label">Избранное</div>
            </div>
            <div class="action-btn" onclick="app.toggleBlockQuick('${participantId}')">
                <div class="action-icon-footer">${participant.blocked ? '🚫' : '🔓'}</div>
                <div class="action-label">Блокировка</div>
            </div>
        `;
        
        footer.dataset.participantId = participantId;
        footer.classList.add('participant-footer');
    }

    restoreMainFooter() {
        const footer = document.getElementById('actionsSection');
        footer.innerHTML = `
            <div class="action-btn" onclick="openDialer()">
                <div class="action-icon-footer">📞</div>
                <div class="action-label">Связь</div>
            </div>
            <div class="action-btn" onclick="openGroupActions()">
                <div class="action-icon-footer">👥</div>
                <div class="action-label">Группа</div>
            </div>
            <div class="action-btn" onclick="openMap()">
                <div class="action-icon-footer">📍</div>
                <div class="action-label">Карта</div>
            </div>
            <div class="action-btn" onclick="openVoiceCommands()">
                <div class="action-icon-footer">🎤</div>
                <div class="action-label">Голос</div>
            </div>
            <div class="action-btn" onclick="openHelp()">
                <div class="action-icon-footer">❓</div>
                <div class="action-label">Справка</div>
            </div>
            <div class="action-btn" onclick="openSettings()">
                <div class="action-icon-footer">⚙️</div>
                <div class="action-label">Настройки</div>
            </div>
        `;
        
        footer.removeAttribute('data-participant-id');
        footer.classList.remove('participant-footer');
    }

    hideParticipantProfileAndRestoreFooter() {
        this.hideParticipantProfile();
        this.restoreMainFooter();
    }

    setupProfileCloseHandler() {
        document.addEventListener('click', (e) => {
            const profilePopup = document.getElementById('participantProfilePopup');
            if (profilePopup && profilePopup.classList.contains('show')) {
                if (e.target === profilePopup) {
                    this.hideParticipantProfileAndRestoreFooter();
                }
            }
        });
    }

// Глобальные функции для совместимости
function openParticipantProfile(participantId) {
    app.showParticipantProfileWithFooter(participantId);
}

function hideParticipantProfile() {
    app.hideParticipantProfileAndRestoreFooter();
}
}

// Глобальные функции для совместимости  
function openParticipantProfile(participantId) {
    app.showParticipantProfileWithFooter(participantId);
}

function hideParticipantProfile() {
    app.hideParticipantProfileAndRestoreFooter();
}
