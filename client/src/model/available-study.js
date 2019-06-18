import Link from 'model/link';
import Study from 'model/study';

export default class AvailableStudy {

  constructor(study, links) {
    this.study = study;
    this.links = links;
  }

  static toObject(json) {
    return new AvailableStudy(
      Study.toObject(json.study),
      Link.toListObject(json.links)
    );
  }
}
