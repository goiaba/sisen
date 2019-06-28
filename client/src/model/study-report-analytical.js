import OptionAnalytical from 'model/option-analytical';

export default class StudyReportAnalytical {

  constructor(acronym, description, options) {
    this.acronym = acronym;
    this.description = description;
    this.options = options;
  }

  static toObject(json) {
    return new StudyReportAnalytical(
      json.acronym,
      json.description,
      OptionAnalytical.toListObject(json.options)
    );
  }
}
