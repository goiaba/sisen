import $ from 'jquery';

export default class MessageHandler {
  constructor() {
    this.containerId = 'toast-alerts-container';
    this.classMapByMessageType = {
      'info': 'alert-info',
      'success': 'alert-success',
      'warning': 'alert-warning',
      'error': 'alert-danger'
    };
  }

  renderMessage(messageText, messageType) {
    //   <div aria-live="polite" aria-atomic="true" id="toast-alerts-container">
    const messageClass = this.getClassByType(messageType);
    const message = $('<div>');
    message.addClass(messageClass);
    message.data('delay', 5000);
    message.data('autohide', true);
    message.html(messageText);
    this.getMessagesContainer().append(message);
    message.toast('show').on('hidden.bs.toast', function() {
      this.remove();
    });
    // Returns new promise just to resolve after 5 seconds, because element
    // will be removed on the bootstrap hidden.bs.toast event defined
    // above.
    return new Promise(function (resolve) {
      setTimeout(() => {
        resolve();
      }, 2500);
    });
  }

  getClassByType(messageType) {
    return "alert toast-alert " + (this.classMapByMessageType[messageType] || this.classMapByMessageType.info);
  }

  getMessagesContainer() {
    var container = $('#'+this.containerId);
    if (!container.length) {
      container = $('<div>');
      container.attr("id", this.containerId);
      $('body').append(container);
    }
    return $(container);
  }
}
