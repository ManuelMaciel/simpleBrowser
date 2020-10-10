'use strict';
const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;
const Bookmark = require('./bookmark');
const config = require('./config');
const emojis = require('./emojis');

let main;
let aside;
let btnNew;
let dialog;
let x;
let y;
let xi;
let yi;
const bookmarks = [];
let currentBookmark;

document.addEventListener('DOMContentLoaded', () => {
	main = document.querySelector('main');
	aside = document.querySelector('aside');
	btnNew = document.querySelector('.btn-new');
	dialog = document.querySelector('#dialog');

	closeDialog();

	for (const emoji of emojis) {
		var el = document.createElement('span');
		el.innerHTML = emoji;
		dialog.appendChild(el);
		el.addEventListener('click', e => {
			currentBookmark.setIcon(emoji);
			closeDialog();
		});
	}

	btnNew.addEventListener('click', newBookmark);

	for (const bookmarkData of config.get('bookmarks')) {
		createBookmark(bookmarkData);
	}

	aside.appendChild(btnNew);

	showBookmark(0);
	setDarkMode();
});

function createBookmark(data) {
	const b = new Bookmark(data);

	main.appendChild(b.view);
	aside.insertBefore(b.handle, aside.lastChild);

	bookmarks.push(b);

	b.hide();

	b.on('click', () => {
		if (b === currentBookmark) {
			return;
		}

		b.show();

		if (currentBookmark !== undefined) {
			currentBookmark.hide();
		}

		currentBookmark = b;

		closeDialog();
	});

	b.on('change', event => {
		document.documentElement.classList.remove('show-settings');
	});

	b.on('page-title-updated', event => {
		let messageCount = 0;
		for (const bookmark of bookmarks) {
			messageCount += Number(
				bookmark.handle.getAttribute('data-message-count')
			);
		}
		if (config.get('showUnreadBadge')) {
			ipcRenderer.send('page-title-updated', messageCount);
		}
	});

	b.on('dragstart', () => {
		if (x === b) {
			return;
		}

		x = b;
		xi = Array.prototype.indexOf.call(aside.children, x.handle);
	});

	b.on('dragover', () => {
		if (y === b) {
			return;
		}

		y = b;
		yi = Array.prototype.indexOf.call(aside.children, y.handle);

		if (yi > xi) {
			yi -= 1;
		}

		main.insertBefore(x.view, y.view);
		aside.insertBefore(x.handle, y.handle);
	});

	b.on('dragend', () => {
		const temp = bookmarks.slice();

		const diff = Math.abs(xi - yi);
		const dir = xi < yi ? 1 : -1;
		for (let i = 0; i < diff; i++) {
			const pos = xi + i * dir;
			bookmarks[pos] = temp[pos + dir];
		}
		bookmarks[yi] = temp[xi];

		save();
	});

	b.on('dblclick', () => openDialog());

	return b;
}

const save = () => {
	const data = [];
	for (const bookmark of bookmarks) {
		const bookmarkData = {
			url: bookmark.handleURL.value,
			icon: bookmark.handleIcon.getAttribute('data-icon'),
			isMuted: bookmark.handle.classList.contains('is-muted')
		};
		if (bookmarkData.url) {
			data.push(bookmarkData);
		} else {
			aside.removeChild(bookmark);
		}
	}
	config.set('bookmarks', data);
	config.set(
		'darkMode',
		document.documentElement.classList.contains('dark-mode')
	);
	document.documentElement.classList.remove('show-settings');
};

const openDialog = () => {
	console.log(currentBookmark.handle.offsetTop);
	dialog.style.top = `${currentBookmark.handle.offsetTop}px`;
	dialog.style.display = 'block';
};

const closeDialog = () => {
	dialog.style.display = 'none';
};

const newBookmark = () => {
	const hasEmpty = bookmarks.filter(bookmark => bookmark.url === '');
	console.log(hasEmpty);
	if (hasEmpty !== 0) {
		createBookmark({ url: '', icon: '', isMuted: false });
		showBookmark(bookmarks.length - 1);
		document.documentElement.classList.add('show-settings');
	}
};

const showBookmark = index => {
	bookmarks[index].handleIcon.click();
};

const remove = () => {
	currentBookmark.remove();
	const index = bookmarks.indexOf(currentBookmark);
	bookmarks.splice(index, 1);
	showBookmark(0);
};

const reload = () => {
	currentBookmark.reload();
};

const back = () => {
	currentBookmark.back();
};

const forward = () => {
	currentBookmark.forward();
};

const toggleHide = () => {
	currentBookmark.toggleHide();
};

const toggleMute = () => {
	currentBookmark.toggleMute();
};

const toggleSettings = () => {
	document.documentElement.classList.toggle('show-settings');
};

const setDarkMode = () => {
	document.documentElement.classList.toggle(
		'dark-mode',
		config.get('darkMode')
	);
};

const toggleDarkMode = () => {
	document.documentElement.classList.toggle('dark-mode');
};

const next = () => {
	let index = getIndex();
	index = index < bookmarks.length - 1 ? index + 1 : 0;
	showBookmark(index);
};

const previous = () => {
	let index = getIndex();
	index = index > 0 ? index - 1 : bookmarks.length - 1;
	showBookmark(index);
};

const getIndex = () => {
	return Array.from(currentBookmark.handle.parentNode.children).indexOf(
		currentBookmark.handle
	);
};

const reset = () => {
	config.clear();
};

const openConfig = () => {
	config.openInEditor();
};

document.addEventListener('keydown', event => {
	if (!event.metaKey) {
		return;
	}

	const num = parseInt(event.key, 10);

	if (num >= 1 && num <= 9) {
		showBookmark(num - 1);
	}
});

ipcRenderer.on('new', newBookmark);

ipcRenderer.on('save', save);

ipcRenderer.on('remove', remove);

ipcRenderer.on('reload', reload);

ipcRenderer.on('back', back);

ipcRenderer.on('forward', forward);

ipcRenderer.on('toggle-hide', toggleHide);

ipcRenderer.on('toggle-mute', toggleMute);

ipcRenderer.on('toggle-settings', toggleSettings);

ipcRenderer.on('toggle-dark-mode', toggleDarkMode);

ipcRenderer.on('next', next);

ipcRenderer.on('previous', previous);

ipcRenderer.on('reset', reset);

ipcRenderer.on('open-config', openConfig);
