import * as path from "path";
import * as yaml from "js-yaml";
import { Logger } from "../../logger";
import { mkdir, writeFile } from "../../fs-utils";
import { Repository } from "./index";
import { readFileCache } from "../../cache";
import { SiteConfig } from "../../config";

export abstract class DataRepository<T> implements Repository<T> {
  protected logger: Logger;
  protected readonly parentFile: string;

  protected constructor(readonly config: SiteConfig, readonly name: string) {
    this.logger = Logger.getLogger("site.repo." + name);
    this.parentFile = path.join(config.siteDir, "data", this.name + ".yml");
  }

  async readAll(): Promise<T> {
    this.logger.info("read all", this.parentFile);
    try {
      const data = await readFileCache.get(this.parentFile);
      return yaml.safeLoad(data) as T;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      return {} as T;
    }
  }

  async saveAll(values: T, force: boolean): Promise<void> {
    this.logger.info("save all");
    const file = this.parentFile;
    await mkdir(path.dirname(file), { recursive: true });
    const flag = force ? "w" : "wx";
    let data = yaml.safeDump(values);
    return await writeFile(file, data, { flag });
  }
}
