import { Company, Employee } from "..";
import { $setting } from "../../factories/setting";
import { $user } from "../../factories/user";

test("hasMany with dbMapping", () => {
  Company.create({ name: "company0" });
  const company1 = Company.create({ name: "company1" });
  const employee = Employee.create({ name: "employee1", company: company1 });

  expect(company1.employees.first()?.equals(employee)).toBeTruthy();
  expect(employee.company.equals(company1)).toBeTruthy();
});

test("hasOne with dbMapping", () => {
  $setting.create({ user: $user.create() });
  const user = $user.create();
  const setting = $setting.create({ user });

  expect(user.reload().setting?.equals(setting)).toBeTruthy();
  expect(setting.reload().user.equals(user)).toBeTruthy();
});
