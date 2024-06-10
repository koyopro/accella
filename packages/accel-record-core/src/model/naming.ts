export class Naming {
  static get modelName() {
    const name = this.name;
    return {
      get human() {
        return name;
      },
    };
  }
}
