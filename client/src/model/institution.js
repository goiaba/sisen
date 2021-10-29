export default class Institution {

  constructor(id, initials, name) {
    this.id = id;
    this.initials = initials;
    this.name = name;
  }

  static toObject(json) {
    return new Institution(
      json.id,
      json.initials,
      json.name
    );
  }

  static toListObject(jsonList) {
    if (!jsonList) {
      return [];
    }
    return jsonList.map((institution) => Institution.toObject(institution));
  }
}
