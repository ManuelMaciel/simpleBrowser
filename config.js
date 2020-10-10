'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		lastWindowState: {
			x: 0,
			y: 0,
			width: 1200,
			height: 700
		},
		darkMode: false,
		showUnreadBadge: true,
		bookmarks: [
			{
				url: 'https://google.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://gmail.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://web.whatsapp.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://github.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://stackoverflow.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://hackerrank.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://youtube.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://soundcloud.com/',
				icon: '',
				isMuted: false
			},
			{
				url: 'https://amazon.com/',
				icon: '',
				isMuted: false
			},
		]
	}
});
