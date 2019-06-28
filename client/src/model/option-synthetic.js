export default class OptionSynthetic {

  constructor(code, description, value) {
    this.code = code;
    this.description = description;
    this.value = value;
  }

  static toObject(json) {
    return new OptionSynthetic(
      json.code,
      json.description,
      json.value
    );
  }

  static toListObject(jsonList) {
    return jsonList.map((option) => OptionSynthetic.toObject(option));
  }
}
