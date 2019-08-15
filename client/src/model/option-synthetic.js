export default class OptionSynthetic {

  constructor(code, description, value, count) {
    this.code = code;
    this.description = description;
    this.value = value;
    this.count = count;
  }

  static toObject(json) {
    return new OptionSynthetic(
      json.code,
      json.description,
      json.value,
      json.count
    );
  }

  static toListObject(jsonList) {
    return jsonList.map((option) => OptionSynthetic.toObject(option));
  }
}
