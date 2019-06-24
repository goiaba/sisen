import Program from 'model/program';

export default class Classroom {

  constructor(code, description, semester, year, program) {
    this.code = code;
    this.description = description;
    this.semester = semester;
    this.year = year;
    this.program = program;
  }

  static toObject(json) {
    return new Classroom(
      json.code,
      json.description,
      json.semester,
      json.year,
      Program.toObject(json.program)
    );
  }
}
