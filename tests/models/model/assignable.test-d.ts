import { $user } from "tests/factories/user";
import { Profile } from "..";

test("assignable decorator", () => {
  const file = new File([], "myfile.txt");
  // avatarFile is assignable
  Profile.create({ user: $user.create(), avatarFile: file });

  // avatarFile は File 型であるため
  // @ts-expect-error
  Profile.create({ user: $user.create(), avatarFile: "" });

  // @ts-expect-error
  Profile.create({ user: $user.create(), invalidName: file });
});
