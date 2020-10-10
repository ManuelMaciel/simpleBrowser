'use strict';
const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const { download } = require('electron-dl');
const electron = require('electron');
const path = require('path');
const menu = require('./menu');
const config = require('./config');

const htmlPath = path.join('file://', __dirname, 'index.html');
const iconPath = path.join(__dirname, 'assets/menubarStopTemplate.png');
const assets = path.join(__dirname, 'assets');

// app.disableHardwareAcceleration();

// download.directory = app.getPath('desktop');

let tray = null;
let win = null;
let isQuitting = false;

app.on('ready', () => {
	electron.Menu.setApplicationMenu(menu);
	createTray();
	createWindow();
});

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () => {
	win.show();
});

app.on('before-quit', () => {
	isQuitting = true;
	config.set('lastWindowState', win.getBounds());
});

const createTray = () => {
	tray = new Tray(iconPath);
	tray.on('click', showWindow);
	// tray.on('right-click', toggleWindow);
};

const createWindow = () => {
	const lastWindowState = config.get('lastWindowState');
	win = new BrowserWindow({
		title: app.getName(),
		x: lastWindowState.x,
		y: lastWindowState.y,
		width: lastWindowState.width,
		height: lastWindowState.height,
		minWidth: 400,
		minHeight: 200,
		alwaysOnTop: config.get('alwaysOnTop')
	});
	win.loadURL(htmlPath);

	win.on('close', event => {
		if (!isQuitting) {
			event.preventDefault();
			app.exit();
		}
	});
};

const toggleWindow = () => {
	if (win.isVisible()) {
		win.hide();
	} else {
		showWindow();
	}
};

const showWindow = () => {
	win.show();
	win.focus();
};

ipcMain.on('page-title-updated', (event, arg) => {
	app.setBadgeCount(arg);
	const icon = arg ? 'menubarStopTemplate.png' : 'menubarDefaultTemplate.png';
	tray.setImage(path.join(assets, icon));
});

ipcMain.on('quit', () => {
	app.quit();
});

ipcMain.on('debug', () => {
	win.webContents.openDevTools({ mode: 'detach' });
});
