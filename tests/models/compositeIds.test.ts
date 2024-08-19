import { Book, UserTeam } from ".";
import { $Author } from "../factories/author";
import { $Book } from "../factories/book";
import { $team } from "../factories/team";
import { $user } from "../factories/user";
import { $UserTeam } from "../factories/userTeam";

test("find()", () => {
  const ut = $UserTeam.create({
    user: $user.create(),
    team: $team.create(),
    assignedBy: "text1",
  });
  expect(ut.reload().assignedBy).toBe("text1");
  expect(ut.primaryKeys).toEqual(["userId", "teamId"]);
  expect(UserTeam.find([ut.userId, ut.teamId]).assignedBy).toBe("text1");
});

test("relation()", () => {
  $Author.create({ firstName: "Jane", lastName: "A" });
  $Author.create({ firstName: "Jane", lastName: "Z" });
  const author = $Author.create({ firstName: "Jane", lastName: "Doe" });
  const book = $Book.create({ title: "Book1", author });
  expect(book.reload().author.lastName).toBe("Doe");

  expect(Book.includes("author").find(book.id).author.lastName).toBe("Doe");
});
