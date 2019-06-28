import OptionSynthetic from 'model/option-synthetic';

export default class StudyReportSynthetic {

  constructor(acronym, description, options) {
    this.acronym = acronym;
    this.description = description;
    this.options = options;
  }

  static toObject(json) {
    return new StudyReportSynthetic(
      json.acronym,
      json.description,
      OptionSynthetic.toListObject(json.options)
    );
  }
}
