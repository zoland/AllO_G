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
                <div class="action-icon ${participant.blocked ? 'disabled' : ''}" onclick="app.makeCall('${participant.id}')" title="Позвонить">📞</div>
                <div class="action-icon ${participant.blocked ? 'disabled' : ''}" onclick="app.sendMessage('${participant.id}')" title="Сообщение">💬</div>
                <div class="action-icon" onclick="app.showLocation('${participant.id}')" title="Местоположение">📍</div>
                <div class="action-icon" onclick="app.viewHistory('${participant.id}')" title="История">📋</div>
                <div class="action-icon ${participant.isFavorite ? 'active' : ''}" onclick="app.toggleFavoriteQuick('${participant.id}')" title="Избранное">${participant.isFavorite ? '⭐' : '☆'}</div>
                <div class="action-icon ${participant.blocked ? 'active' : ''}" onclick="app.toggleBlockQuick('${participant.id}')" title="Блокировка">${participant.blocked ? '🚫' : '🔓'}</div>
            </div>
        `;

        return card;
    }
