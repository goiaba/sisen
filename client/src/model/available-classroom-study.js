import Link from 'model/link';
import Classroom from 'model/classroom';
import Study from 'model/study';

export default class AvailableClassroomStudy {

  constructor(classroom, study, answered, students, links) {
    this.classroom = classroom;
    this.study = study;
    this.answered = answered;
    this.students = students;
    this.links = links;
  }

  static toObject(json) {
    return new AvailableClassroomStudy(
      Classroom.toObject(json.sclass),
      Study.toObject(json.study),
      json.total_answered,
      json.total_students,
      Link.toListObject(json.links)
    );
  }
}
