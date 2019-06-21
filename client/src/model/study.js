export default class Study {

  constructor(id, acronym, description, answered) {
    this.id = id;
    this.acronym = acronym;
    this.description = description;
    this.answered = answered;
  }

  static toObject(json) {
    return new Study(
      json.id,
      json.acronym,
      json.description,
      json.answered
    );
  }
}
