import type { APIContext } from "astro";
import { Parameters } from "./parameters.js";
import { createSession, Session } from "./session.js";
import type { Model } from "accel-record";

export class Helper {
  public params: Parameters;
  public session: Session;
  protected cache: Record<string, any> = {};

  constructor(protected context: APIContext) {
    const data = new FormData();
    this.params = new Parameters(data);
    this.session = createSession(context);
  }

  static async init<T extends typeof Helper>(
    this: T,
    context: APIContext
  ): Promise<InstanceType<T>> {
    const helper = new this(context) as InstanceType<T>;
    await helper.load();
    return helper;
  }

  async load() {
    let data = new FormData();
    try {
      data = await this.context.request.clone().formData();
    } catch (e) {
      // noop
    }
    this.params = new Parameters(data);
  }

  logIn = (resource: Model) => {
    this.session.store(resource);
  };

  logOut = (resource?: Model) => {
    const scope = resource?.class().name ?? "Account";
    this.session.delete(scope);
  };
}
