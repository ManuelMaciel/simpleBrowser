'use strict';
const path = require('path');
const electron = require('electron');

let tray = null;
const assets = path.join(__dirname, 'assets/');

exports.create = win => {
	const toggleWin = () => {
		if (win.isVisible()) {
			win.hide();
		} else {
			win.show();
		}
	};
	tray = new electron.Tray(path.join(assets, 'purple8.png'));
	tray.on('click', toggleWin);
};

exports.setBadge = shouldDisplayUnread => {
	const icon = shouldDisplayUnread ? 'purple8.png' : 'red8.png';
	tray.setImage(path.join(assets, icon));
};
