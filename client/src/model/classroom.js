import Program from 'model/program';

export default class Classroom {

  constructor(id, code, description, semester, year) {
    this.id = id;
    this.code = code;
    this.description = description;
    this.semester = semester;
    this.year = year;
  }

  static toObject(json) {
    return new Classroom(
      json.id,
      json.code,
      json.description,
      json.semester,
      json.year
    );
  }
}
