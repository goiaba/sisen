export default class Link {

  constructor(rel, uri, method, icon) {
    this.rel = rel;
    this.uri = uri;
    this.method = method;
    this.icon = icon;
  }

  static toObject(json) {
    return new Link(
      json.rel,
      json.uri,
      json.method,
      json.icon
    );
  }

  static toListObject(jsonList) {
    return jsonList.map((link) => Link.toObject(link));
  }
}
