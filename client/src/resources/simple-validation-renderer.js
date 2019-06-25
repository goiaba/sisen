import {ValidationError, RenderInstruction} from 'aurelia-validation';

export class SimpleValidationRenderer {

  render(instruction) {
    for (let {result, elements} of instruction.unrender) {
      for (let element of elements) {
        this.remove(element, result);
      }
    }

    for (let {result, elements} of instruction.render) {
      for (let element of elements) {
        this.add(element, result);
      }
    }
  }

  add(element, result) {
    if (result.valid) return;
    const message = document.createElement('div');
    message.className = 'validation-message-div';
    message.textContent = result.message;
    message.id = `validation-message-${result.id}`;
    element.classList.add('has-error');
    element.parentNode.insertBefore(message, element.nextSibling);
  }

   remove(element, result) {
     if (result.valid) return;
    const message = element.parentElement.querySelector(`#validation-message-${result.id}`);
    if (message) {
      element.parentElement.removeChild(message);
      element.classList.remove('has-error');
    }
  }
}
