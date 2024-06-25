import { Mix } from "accel-record-core";

class A {
  static a = "a";

  a = "a";

  get aa() {
    return "aa";
  }
}

class B {}

class AB extends Mix(A, B) {}

class C {
  static c = "c";

  c = "c";
}

class ABC extends Mix(AB, C) {}

test("mix", () => {
  expect(AB.a).toBe("a");

  expect(ABC.a).toBe("a");
  expect(ABC.c).toBe("c");

  const ab = new AB();
  expect(ab.a).toBe("a");
  expect(ab.aa).toBe("aa");

  const abc = new ABC();
  expect(abc.a).toBe("a");
  expect(abc.c).toBe("c");
  expect(abc.aa).toBe("aa");
});
