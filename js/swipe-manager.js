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
                            this.app.popupManager.showQuickContact();
                        } else {
                            this.app.popupManager.showCreateParticipant();
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
