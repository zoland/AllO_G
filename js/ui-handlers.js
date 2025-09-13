function showInfo() {
    app.popupManager.showInfo();
}

function hideInfo() {
    app.popupManager.hideInfo();
}

function showProtocolInfo(protocol) {
    app.popupManager.showProtocolInfo(protocol);
}

function hideProtocolInfo() {
    app.popupManager.hideProtocolInfo();
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
    app.popupManager.showParticipantProfile(participantId);
}

function viewHistory(participantId) {
    if (participantId) {
        const participant = app.participants.get(participantId);
        if (participant) {
            app.showNotification(`📋 История связи с ${participant.callsign} (в разработке)`);
        }
    } else {
        const menu = document.getElementById('participantMenu');
        const menuParticipantId = menu.dataset.participantId;
        const participant = app.participants.get(menuParticipantId);
        
        if (participant) {
            app.showNotification(`📋 История связи с ${participant.callsign} (в разработке)`);
        }
        app.hideContextMenu();
    }
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
    app.popupManager.hideQuickContact();
    
    const number = prompt('Введите номер телефона:');
    if (number) {
        window.location.href = `tel:${number}`;
    }
}

function openCallsignSearch() {
    app.popupManager.hideQuickContact();
    
    const callsign = prompt('Введите позывной для поиска:');
    if (callsign) {
        app.showNotification(`🔍 Поиск "${callsign}" в сетях...`);
    }
}

function searchInNetwork() {
    app.popupManager.hideQuickContact();
    app.showNotification('🔍 Поиск участников в локальной сети...');
}

function saveParticipant(event) {
    app.saveParticipant(event);
}

function hideCreateParticipant() {
    app.popupManager.hideCreateParticipant();
}

function hideQuickContact() {
    app.popupManager.hideQuickContact();
}

function hideParticipantProfile() {
    app.popupManager.hideParticipantProfile();
}

function makeCallFromProfile(participantId) {
    app.makeCall(participantId);
}

function sendMessageFromProfile(participantId) {
    app.sendMessage(participantId);
}

function toggleFavoriteFromProfile(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        participant.isFavorite = !participant.isFavorite;
        app.renderParticipants();
        app.popupManager.showParticipantProfile(participantId);
        
        const status = participant.isFavorite ? 'добавлен в избранное' : 'удален из избранного';
        app.showNotification(`⭐ ${participant.callsign} ${status}`);
    }
}

function openHistoryFromProfile(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        app.showNotification(`📋 История связи с ${participant.callsign} (в разработке)`);
    }
}

function openRolesFromProfile(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        app.showNotification(`🎭 Управление ролями ${participant.callsign} (в разработке)`);
    }
}

function openCommunicationsFromProfile(participantId) {
    const participant = app.participants.get(participantId);
    if (participant) {
        app.showNotification(`📞 Настройки связи с ${participant.callsign} (в разработке)`);
    }
}
