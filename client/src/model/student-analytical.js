import Score from 'model/score';
export default class StudentAnalytical {

  constructor(email, first_name, last_name, scores) {
    this.email = email;
    this.first_name = first_name;
    this.last_name = last_name;
    this.scores = {};
    for (var score of scores) {
      this.scores[score.code] = score;
    }
  }

  static toObject(json) {
    return new StudentAnalytical(
      json.email,
      json.first_name,
      json.last_name,
      Score.toListObject(json.scores)
    );
  }

  static toListObject(jsonList) {
    return jsonList.map((score) => StudentAnalytical.toObject(score));
  }
}
