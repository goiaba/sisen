export default class ComposeStudyDetail {

  constructor(numberOfMainStudyOptionsToShow) {
    this.numberOfMainStudyOptionsToShow = numberOfMainStudyOptionsToShow;
  }

  activate(model) {
    this.study = model;
    // Using slice() to create a copy of the original array before sorting it
    this.scores = this.study.study_option_scores.slice().sort((a, b) => b.value - a.value);
    this.mainStudyOptionsAsString = this.getStudyOptionsByMaxScoreAsString();
  }

  attached() {
  }

  getImageSrc(filename) {
    return `/assets/images/students/${this.study.study.acronym}/${filename}`;
  }

  getStudyOptionsByMaxScoreAsString() {
    const reduceOptionsToString = (acc, el, idx, arr) => {
      const marker = (idx === arr.length - 1) ? ' e ' : ', ';
      return (idx !== 0)
        ? (acc.description || acc) + marker + el.description
        : (el.description || el)
    };
    const count = (this.numberOfMainStudyOptionsToShow <= this.scores.length)
      ? this.numberOfMainStudyOptionsToShow
      : this.scores.length;
    return this.scores.slice(0, count).reduce(reduceOptionsToString, '');
  }
}
