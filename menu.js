'use strict';
const electron = require('electron');
const config = require('./config');

const { app, BrowserWindow, shell } = electron;
const appName = app.getName();

function sendAction(action) {
	const [win] = BrowserWindow.getAllWindows();
	win.webContents.send(action);
}

const appMenu = [
	{ role: 'about' },
	{ type: 'separator' },
	{
		label: 'Show Unread Badge',
		type: 'checkbox',
		checked: config.get('showUnreadBadge'),
		click() {
			config.set('showUnreadBadge', !config.get('showUnreadBadge'));
		}
	},
	{ type: 'separator' },
	{ role: 'services', submenu: [] },
	{ type: 'separator' },
	{ role: 'hide' },
	{ role: 'hideothers' },
	{ role: 'unhide' },
	{ type: 'separator' },
	{ role: 'quit' }
];

const bookmarkMenu = [
	{
		label: 'New',
		accelerator: 'Cmd+N',
		click() {
			sendAction('new');
		}
	},
	{
		label: 'Save',
		accelerator: 'Cmd+S',
		click() {
			sendAction('save');
		}
	},
	{
		label: 'Remove',
		accelerator: 'Cmd+Backspace',
		click() {
			sendAction('remove');
		}
	},
	{
		label: 'Reload',
		accelerator: 'Cmd+Shift+R',
		click() {
			sendAction('reload');
		}
	},
	{
		label: 'Back',
		accelerator: 'Cmd+LeftArrow',
		click() {
			sendAction('back');
		}
	},
	{
		label: 'Forward',
		accelerator: 'Cmd+RightArrow',
		click() {
			sendAction('forward');
		}
	},
	// {label: 'Toggle Hide', accelerator: 'Cmd+Shift+H', click() {
	// 	sendAction('toggle-hide');
	// }},
	{
		label: 'Toggle Mute',
		accelerator: 'Cmd+Shift+M',
		click() {
			sendAction('toggle-mute');
		}
	}
];

const viewMenu = [
	{
		label: 'Configuraciones',
		accelerator: 'Cmd+Shift+S',
		click() {
			sendAction('toggle-settings');
		}
	},
	{
		label: 'Modo Oscuro',
		accelerator: 'Cmd+D',
		click() {
			sendAction('toggle-dark-mode');
		}
	}
];

const windowMenu = [
	{ role: 'minimize' },
	{ role: 'close' },
	{ type: 'separator' },
	{
		label: 'Seleccionar siguiente marcador',
		accelerator: 'Ctrl+Tab',
		click() {
			sendAction('next');
		}
	},
	{
		label: 'Seleccionar marcador anterior',
		accelerator: 'Ctrl+Shift+Tab',
		click() {
			sendAction('previous');
		}
	},
	{ type: 'separator' },
	{
		type: 'checkbox',
		label: 'Always on Top',
		accelerator: 'Cmd+Shift+T',
		checked: config.get('alwaysOnTop'),
		click(item, focusedWindow) {
			config.set('alwaysOnTop', item.checked);
			focusedWindow.setAlwaysOnTop(item.checked);
		}
	}
];

const helpMenu = [
	{
		label: 'Instagram',
		click() {
			shell.openExternal('https://instagram.com/m_maciel7');
		}
	},
	{
		label: 'Codigo fuente',
		click() {
			shell.openExternal('https://github.com/ManuelMaciel');
		}
	},
	{ type: 'separator' },
	{ role: 'toggledevtools' },
	{ type: 'separator' },
	{
		label: 'Reiniciar Marcadores',
		click() {
			sendAction('reset');
		}
	},
	{
		label: 'Abrir Configuraciones',
		click() {
			sendAction('open-config');
		}
	}
];

const menu = [
	{
		label: appName,
		submenu: appMenu
	},
	{
		role: 'editMenu'
	},
	{
		label: 'Marcadores',
		submenu: bookmarkMenu
	},
	{
		label: 'Ver',
		submenu: viewMenu
	},
	{
		role: 'window',
		submenu: windowMenu
	},
	{
		role: 'help',
		submenu: helpMenu
	}
];

module.exports = electron.Menu.buildFromTemplate(menu);
