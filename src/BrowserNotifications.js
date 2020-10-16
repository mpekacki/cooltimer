class BrowserNotifications {
    requestPermission() {
        return Notification.requestPermission();
    }

    createNotification(title, params) {
        new Notification(title, params);
    }
}

export default BrowserNotifications;