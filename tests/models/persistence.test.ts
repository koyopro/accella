import { Post, User } from ".";
import { $post } from "../factories/post";
import { $user } from "../factories/user";
import { $ValidateSample } from "../factories/validateSample";

describe("Persistence", () => {
  test("#save()", () => {
    const posts = [
      Post.build({ title: "post1" }),
      Post.build({ title: "post2" }),
    ];
    const u = $user.build({ posts });
    if (!u.save()) {
      throw new Error("Failed to save");
    }
    // u should be a persisted User
    expect(u.id).not.toBeUndefined();
    expect(Post.all().load()).toHaveLength(2);

    u.isReadonly = true;
    expect(() => u.save()).toThrowError("Readonly record");
  });

  test("#save() with invalid record", () => {
    const sample = $ValidateSample.build({ key: "" });
    expect(sample.save()).toBe(false);
    expect(sample.errors.fullMessages).toContain("Key can't be blank");
    expect(sample.isPersisted()).toBe(false);
  });

  test("#save() with invalid record and skip validation", () => {
    const sample = $ValidateSample.build({ key: "" });
    expect(sample.save({ validate: false })).toBe(true);
    expect(sample.isPersisted()).toBe(true);
  });

  test(".create() with invalid record", () => {
    expect(() => {
      $ValidateSample.create({ key: "" });
    }).toThrowError("Failed to create");
  });

  test("#update()", () => {
    const u = $user.build({ name: "hoge" });
    if (!u.update({ name: "fuga" })) {
      throw new Error("Failed to update");
    }
    // u should be a persisted User
    expect(u.id).not.toBeUndefined();
    expect(u.name).toBe("fuga");
    expect(User.all().load()[0].name).toBe("fuga");
  });

  test("#delete()", () => {
    const u = $user.create();
    expect(u.isReadonly).toBe(false);
    expect(u.isDestroyed).toBe(false);
    expect(User.count()).toBe(1);

    expect(u.delete()).toBe(true);

    expect(u.isReadonly).toBe(true);
    expect(u.isDestroyed).toBe(true);
    expect(User.count()).toBe(0);
  });

  test("#destroy()", () => {
    const p = $post.build();
    const u = $user.create({ posts: [p] });
    expect(u.isReadonly).toBe(false);
    expect(u.isDestroyed).toBe(false);
    expect(User.count()).toBe(1);
    expect(Post.count()).toBe(1);

    expect(u.destroy()).toBe(true);

    expect(u.isReadonly).toBe(true);
    expect(u.isDestroyed).toBe(true);
    expect(User.count()).toBe(0);
    expect(Post.count()).toBe(0);
  });

  test("asPersisted()", () => {
    const u = $user.build({});
    u.save();
    u.isPersisted();
    const v = u.asPersisted();
    expect(v!.id).not.toBeUndefined();
    expect(v!.id).toBe(u.id);
  });
});
