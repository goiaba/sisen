export default class ComposeStudyDetail {

  constructor(numberOfMainStudyOptionsToShow) {
    this.numberOfMainStudyOptionsToShow = numberOfMainStudyOptionsToShow;
  }

  activate(model) {
    this.study = model;
  }

  attached() {
    this.mainStudyOptions = this.getStudyOptionByMaxScoreAsString();
  }

  getStudyOptionByMaxScoreAsString() {
    // Using slice() to create a copy of the original array before sorting it
    const scores = this.study.study_option_scores.slice().sort((a, b) => b.value - a.value);
    if (scores.length === 0) return 'Não existem opções disponíveis';
    const count = (this.numberOfMainStudyOptionsToShow <= scores.length)
      ? this.numberOfMainStudyOptionsToShow
      : scores.length;
    return (count === 1)
      ? scores[count-1].description
      : scores.slice(0, count).reduce(this.reduceOptionsToString);
  }

  reduceOptionsToString(acc, el, idx, arr) {
    const marker = (idx === arr.length - 1) ? ' e ' : ', ';
    return (acc.description || acc) + marker + el.description;
  }
}
