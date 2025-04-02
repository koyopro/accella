export class RecordNotFound extends Error {}
export class AttributeNotFound extends Error {}
export class PendingMigrationError extends Error {
  constructor(message?: string) {
    super(
      message || "Migrations are pending. Please run `npx prisma migrate deploy` to apply them."
    );
    this.name = "PendingMigrationError";
  }
}
