import Institution from 'model/institution';

export default class Program {

  constructor(name, institution) {
    this.name = name;
    this.institution = institution;
  }

  static toObject(json) {
    return new Program(
      json.name,
      Institution.toObject(json.institution)
    );
  }
}
