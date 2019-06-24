export default class Institution {

  constructor(initials, name) {
    this.initials = initials;
    this.name = name;
  }

  static toObject(json) {
    return new Institution(
      json.initials,
      json.name
    );
  }
}
