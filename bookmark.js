const { shell, dialog } = require('electron').remote;
const { URL } = require('url');
const faviconUrl = require('favicon-url');
const EventEmitter = require('event-emitter-es6');
const lookup = require('./lookup');

class Bookmark extends EventEmitter {
    constructor(data) {
        super();

        this.handle = document.createElement('div');
        this.handle.classList.add('bookmark');

        this.view = new WebView();
        this.view.autosize = true;
        this.view.allowpopups = true;
        this.view.plugins = true;

        this.handleURL = document.createElement('input');
        this.handleURL.classList.add('url');
        this.handleURL.type = 'text';
        this.handleURL.placeholder = 'https://';
        this.handleURL.autofocus = true;

        this.handleIcon = document.createElement('div');
        this.handleIcon.classList.add('icon');
        this.handleIcon.draggable = true;

        this.handleHistory = document.createElement('div');
        this.handleHistory.classList.add('history');

        if (data.url !== '') {
            this.view.src = this.addHTTP(data.url);
            this.handleURL.value = this.view.src;
        }

        if (data.icon === '' || data.icon === null) {
            if (data.url !== '') {
                this.getIcon(this.view.src);
            }
        } else {
            this.setIcon(data.icon);
            // this.handleIcon.setAttribute('data-icon', data.icon);
            // this.handleIcon.style.backgroundImage = `url(${data.icon})`;
        }

        this.handle.classList.toggle('is-muted', data.isMuted);

        this.handle.appendChild(this.handleURL);
        this.handle.appendChild(this.handleIcon);
        this.handle.appendChild(this.handleHistory);

        /* Listeners */

        this.view.addEventListener('dom-ready', () => {
            // This.view.focus();
            this.view.setAudioMuted(this.handle.classList.contains('is-muted'));
            // this.handleURL.value = this.view.src;
        });

        this.view.addEventListener('new-window', event => {
            event.preventDefault();
            const url = new URL(event.url);
            const href = url.href;
            const protocol = url.protocol;
            if (protocol === 'http:' || protocol === 'https:') {
                console.log(href);
                if (href.includes('accounts.google.com') || href.includes('drive?authuser')) {
                    this.view.src = href;
                } else {
                    shell.openExternal(href);
                }
            }
        });

        this.view.addEventListener('page-title-updated', event => {
            event.preventDefault();
            const title = event.title;

            if (this.view.src.includes('messenger') && !title.includes('Messenger')) {
                return;
            }

            let messageCount = /\(([0-9]+)\)/.exec(title);
            messageCount = messageCount ? Number(messageCount[1]) : 0;

            this.handle.classList.toggle('unread', messageCount);
            this.handle.setAttribute('data-message-count', messageCount);
            this.emit('page-title-updated', this);
        });

        this.handleURL.addEventListener('change', () => {
            this.view.src = this.addHTTP(this.handleURL.value);
            this.getIcon(this.view.src);
            this.emit('change');
        });

        this.handleIcon.addEventListener('dblclick', () => {
            this.emit('dblclick');
            // const iconType = dialog.showMessageBox({
            //  type: 'question',
            //  buttons: ['emoji', 'image']
            // });
            // switch (iconType) {
            //  case 0:
            //      const icon = dialog.showMessageBox({
            //          type: 'question',
            //          buttons: emoji,
            //          noLink: true
            //      });
            //      if (icon === undefined) {
            //          return false;
            //      }
            //      this.handleIcon.innerHTML = emoji[icon];
            //      this.handleIcon.setAttribute('data-icon', '');
            //      this.handleIcon.style.backgroundImage = '';
            //      break;
            //  case 1:
            //      const image = dialog.showOpenDialog({
            //          properties: ['openFile', 'openDirectory']
            //      });
            //      if (image === undefined) {
            //          return false;
            //      }
            //      this.handleIcon.setAttribute('data-icon', image);
            //      this.handleIcon.style.backgroundImage = `url(${image})`;
            //      this.handleIcon.innerHTML = '';
            //      break;
            // }
        });

        this.handle.addEventListener('click', () => {
            this.emit('click', this);
        });

        this.handleIcon.addEventListener('dragstart', () => {
            this.emit('dragstart', this);
        });

        this.handleIcon.addEventListener('dragover', () => {
            this.emit('dragover', this);
        });

        this.handleIcon.addEventListener('dragend', () => {
            this.emit('dragend', this);
        });
    }

    toggleMute() {
        this.handle.classList.toggle('is-muted');
        this.view.setAudioMuted(this.handle.classList.contains('is-muted'));
    }

    show() {
        this.handle.classList.add('active');
        this.view.classList.remove('hidden');
    }

    hide() {
        this.handle.classList.remove('active');
        this.view.classList.add('hidden');
    }

    reload() {
        this.view.reload();
    }

    back() {
        this.view.goBack();
    }

    forward() {
        this.view.goForward();
    }

    remove() {
        this.handle.parentNode.removeChild(this.handle);
        this.view.parentNode.removeChild(this.view);
    }

    getIcon(url) {
        for (const entry in lookup) {
            if (url.includes(entry)) {
                this.setIcon(lookup[entry]);
                return;
            }
        }
        const host = new URL(url).host;
        faviconUrl(host, { timeout: 2000, minBufferLength: 400 }, favicon => {
            if (favicon !== null) {
                this.setIcon(favicon);
            }
        });
    }

    setIcon(icon) {
        if (icon.length > 8) {
            this.handleIcon.style.backgroundImage = `url(${icon})`;
            this.handleIcon.innerHTML = '';
        } else {
            this.handleIcon.innerHTML = icon;
            this.handleIcon.style.backgroundImage = '';
        }
        this.handleIcon.setAttribute('data-icon', icon);
    }

    addHTTP(url) {
        if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
            url = `http://${url}`;
        }
        return url;
    }
}

module.exports = Bookmark;
