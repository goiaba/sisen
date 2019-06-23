export default class MessageHandler {
  constructor() {
    this.availableMessageTypes = ['info', 'error', 'warning', 'success']
    this.iconMapByMessageType = {
      'info': 'fa-info-circle',
      'success': 'fa-check',
      'warning': 'fa-warning',
      'error': 'fa-times-circle'
    };
    this.nextMessageId = 1;
    this.renderedMessages = [];
  }

  renderMessage(messageText, messageType) {
    const messageClass = this.getClassByType(messageType);
    const messageId = `${messageClass}-${this.nextMessageId}`;
    const message = document.createElement('div');
    message.className = messageClass;
    message.id = messageId;
    message.textContent = messageText;
    message.style = `top: ${this.nextMessagePosition()}`;
    const icon = document.createElement('i');
    icon.classList.add('fa');
    icon.classList.add(this.getIconByType(messageType));
    message.appendChild(icon);
    document.body.appendChild(message);
    this.renderedMessages.push(messageId);
    const that = this;
    return new Promise(function (resolve) {
      setTimeout(() => {
        that.unrenderMessage(messageId);
        resolve();
      }, 5000);
    });
  }

  unrenderMessage(id) {
    const messageIndex = this.renderedMessages.indexOf(id);
    if (messageIndex >= 0) {
      const message = this.getMessageById(id);
      message.parentNode.removeChild(message);
      this.renderedMessages.splice(messageIndex, 1);
    }
  }

  nextMessagePosition() {
    let nextPosition = 0;
    let gap = 5;
    for (let id of this.renderedMessages) {
      const height = this.getMessageById(id).clientHeight;
       nextPosition += height + gap;
    }
    return  nextPosition + 'px';
  }

  getMessageById(id) {
    return document.querySelector('#' + id);
  }

  getClassByType(messageType) {
    if (this.availableMessageTypes.indexOf(messageType) < 0)
      return 'isa-info';
    return `isa-${messageType}`;
  }

  getIconByType(messageType) {
    return this.iconMapByMessageType[messageType] || this.iconMapByMessageType.info;
  }
}
