import Program from 'model/program';

export default class Classroom {

  constructor(id, code, description, semester, year, program) {
    this.id = id;
    this.code = code;
    this.description = description;
    this.semester = semester;
    this.year = year;
    this.program = program;
  }

  static toObject(json) {
    return new Classroom(
      json.id,
      json.code,
      json.description,
      json.semester,
      json.year,
      Program.toObject(json.program)
    );
  }
}
