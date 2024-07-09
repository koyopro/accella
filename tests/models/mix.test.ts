import { Mix } from "accel-record-core";

class A {
  static a = "a";

  a = "a";
  errors: string[] = [];

  get aa() {
    return "aa";
  }

  validate() {
    this.errors.push("a");
  }
}

class B {}

class AB extends Mix(A, B) {}

class C {
  static c = "c";

  c = "c";

  validate<T extends A>(this: T) {
    this.errors.push("c");
  }
}

class ABC extends Mix(AB, C) {}

test("mix", () => {
  expect(AB.a).toBe("a");

  expect(ABC.a).toBe("a");
  expect(ABC.c).toBe("c");

  const ab = new AB();
  expect(ab.a).toBe("a");
  expect(ab.aa).toBe("aa");
  expect(ab instanceof A).toBe(true);

  const abc = new ABC();
  expect(abc.a).toBe("a");
  expect(abc.c).toBe("c");
  expect(abc.aa).toBe("aa");
  expect(abc instanceof A).toBe(true);

  ab.validate();
  expect(ab.errors).toEqual(["a"]);
  abc.validate();
  expect(abc.errors).toEqual(["a", "c"]);
});
