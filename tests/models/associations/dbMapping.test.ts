import { Company, Employee } from "..";

test("hasMany with dbMapping", () => {
  Company.create({ name: "company0" });
  const company1 = Company.create({ name: "company1" });
  const employee = Employee.create({ name: "employee1", company: company1 });

  expect(company1.employees.first()?.equals(employee)).toBeTruthy();
  expect(employee.company.equals(company1)).toBeTruthy();
});
