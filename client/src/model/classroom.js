import Program from 'model/program';
import Professor from 'model/professor';

export default class Classroom {

  constructor(id, code, description, semester, year, program, professors) {
    this.id = id;
    this.code = code;
    this.description = description;
    this.semester = semester;
    this.year = year;
    this.program = program;
    this.professors = professors;
  }

  static toObject(json) {
    return new Classroom(
      json.id,
      json.code,
      json.description,
      json.semester,
      json.year,
      Program.toObject(json.program),
      Professor.toListObject(json.professors)
    );
  }

  static toListObject(jsonList) {
    if (!jsonList) {
      return [];
    }
    return jsonList.map((classroom) => Classroom.toObject(classroom));
  }
}
