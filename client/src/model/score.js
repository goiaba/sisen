export default class Score {

  constructor(code, description, value) {
    this.code = code;
    this.description = description;
    this.value = value;
  }

  static toObject(json) {
    return new Score(
      json.code,
      json.description,
      json.value
    );
  }

  static toListObject(jsonList) {
    return jsonList.map((value) => Score.toObject(value));
  }
}
