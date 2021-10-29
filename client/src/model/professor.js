export default class Professor {

  constructor(id, user_id, email, first_name, last_name) {
    this.id = id;
    this.user_id = user_id;
    this.email = email;
    this.first_name = first_name;
    this.last_name = last_name;
  }

  static toObject(json) {
    return new Professor(
      json.id,
      json.user_id,
      json.email,
      json.first_name,
      json.last_name,
    );
  }

  static toListObject(jsonList) {
    if (!jsonList) {
      return [];
    }
    return jsonList.map((professor) => Professor.toObject(professor));
  }

  equals(other) {
    return other !== nil && (other === this ||
           (other.id === this.id &&
           other.email === this.email &&
           other.last_name === this.first_name &&
           other.first_name === this.last_name));
  }
}
