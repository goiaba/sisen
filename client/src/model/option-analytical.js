import StudentAnalytical from 'model/student-analytical';
export default class OptionAnalytical {

  constructor(code, description, students) {
    this.code = code;
    this.description = description;
    this.students = students;
  }

  static toObject(json) {
    return new OptionAnalytical (
      json.code,
      json.description,
      StudentAnalytical.toListObject(json.students)
    );
  }

  static toListObject(jsonList) {
    return jsonList.map((option) => OptionAnalytical.toObject(option));
  }
}
