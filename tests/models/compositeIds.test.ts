import { Author, Book, UserTeam } from ".";
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
  const auther0 = $Author.create({ firstName: "Jane", lastName: "A" });
  $Book.create({ title: "Book2", author: auther0 });
  $Author.create({ firstName: "Jane", lastName: "Z" });
  const author = $Author.create({ firstName: "Jane", lastName: "Doe" });
  const book = $Book.create({ title: "Book1", author });
  expect(book.reload().author.lastName).toBe("Doe");

  expect(Book.includes("author").find(book.id).author.lastName).toBe("Doe");

  const authors = Author.includes("books").order("lastName").toArray();
  expect(authors.length).toBe(3);
  expect((authors[0].books as any).cache.length).toBe(1);
  expect((authors[1].books as any).cache.length).toBe(1);
  expect((authors[2].books as any).cache.length).toBe(0);
});

test("joins", () => {
  const author0 = $Author.create({ firstName: "Jane", lastName: "A" });
  $Book.create({ title: "Book0", author: author0 });
  const author = $Author.create({ firstName: "Jane", lastName: "Doe" });
  $Book.create({ title: "Book1", author });

  expect(Book.joins("author").count()).toBe(2);
  expect(Author.joins("books").count()).toBe(2);
});
