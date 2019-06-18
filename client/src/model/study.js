export default class Study {

  constructor(acronym, description) {
    this.acronym = acronym;
    this.description = description;
  }

  static toObject(json) {
    return new Study(
      json.acronym,
      json.description
    );
  }
}
