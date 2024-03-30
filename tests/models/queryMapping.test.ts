import { $user } from "../factories/user";
import { Profile } from "./index";

describe("Query with DB mappings", () => {
  test(".order()", () => {
    expect(() => Profile.order("userId").first()).not.toThrowError();
    expect(() => Profile.order("bio").first()).not.toThrowError();
  });
  test(".where", () => {
    expect(() => Profile.where({ userId: 1 }).first()).not.toThrowError();
  });
  test(".whereNot()", () => {
    expect(() => Profile.whereNot({ userId: 1 }).first()).not.toThrowError();
  });
  test(".findBy()", () => {
    expect(() => Profile.findBy({ userId: 1 })).not.toThrowError();
  });
  test("aggregate", () => {
    expect(() => Profile.minimum("userId")).not.toThrowError();
    expect(() => Profile.maximum("userId")).not.toThrowError();
    expect(() => Profile.average("userId")).not.toThrowError();
  });
  test("select", () => {
    Profile.create({ user: $user.create({ id: 1 }), bio: "I am me." });
    const profile = Profile.select("userId", "bio").first();
    expect(profile?.userId).toBe(1);
    expect(profile?.bio).toBe("I am me.");
  });
});
