import Institution from 'model/institution';

export default class Program {

  constructor(id, name, institution) {
    this.id = id;
    this.name = name;
    this.institution = institution;
  }

  static toObject(json) {
    return new Program(
      json.id,
      json.name,
      Institution.toObject(json.institution)
    );
  }

  static toListObject(jsonList) {
    if (!jsonList) {
      return [];
    }
    return jsonList.map((program) => Program.toObject(program));
  }
}
