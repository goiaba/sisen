export default class Study {

  constructor(acronym, description, answered) {
    this.acronym = acronym;
    this.description = description;
    this.answered = answered;
  }

  static toObject(json) {
    return new Study(
      json.acronym,
      json.description,
      json.answered
    );
  }
}
