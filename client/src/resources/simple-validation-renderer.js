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
    if (result.valid) {
      element.classList.add('is-valid');
    } else {
      const message = document.createElement('div');
      message.className = 'invalid-feedback';
      message.textContent = result.message;
      message.id = `validation-message-${result.id}`;
      element.classList.add('is-invalid');
      element.parentNode.insertBefore(message, element.nextSibling);
    }
  }

  remove(element, result) {
    const message = element.parentElement.querySelector(`#validation-message-${result.id}`);
    if (message) {
      element.parentElement.removeChild(message);
    }
    element.classList.remove('is-invalid');
    element.classList.add('is-valid');
  }
}
