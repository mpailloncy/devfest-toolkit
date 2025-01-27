import { Config } from "../config";
import { prompt } from "enquirer";

import { AbstractSiteTool } from "./AbstractSiteTool";
import * as path from "path";
import { writeFile } from "../fs-utils";
import { buildKey, isUrl } from "../strings";
import { Social } from "../site/models/socials";
import { Speaker } from "../site/models/speaker";
import { loadExtraSpeakers } from "../addon/addonSpeaker";

interface SpeakerPrompt extends Omit<Speaker, "key" | "socials"> {
  twitter?: string;
}

export class AddSpeakerTool extends AbstractSiteTool {
  constructor() {
    super(
      "add-speaker",
      "Append a new speaker to add-on (require a generation after)"
    );
  }

  async run(config: Config): Promise<void> {
    const speakersFile = path.join(config.addonDir, "speakers.json");
    const speakers = await loadExtraSpeakers(config);

    const newSpeaker = await this.createNewSpeaker();
    speakers.push(newSpeaker);

    this.logger.info("Going to add", newSpeaker);
    const confirm =
      config.force ||
      (await prompt<{ question: boolean }>([
        { type: "confirm", name: "question", message: "Confirm creation?" }
      ])).question;

    if (confirm) {
      this.logger.info("store all extra speakers", speakersFile);
      await writeFile(speakersFile, JSON.stringify(speakers, null, 2), "utf-8");
    } else {
      this.logger.warn("Cancel speaker creation");
    }
  }

  private async createNewSpeaker(): Promise<Speaker> {
    const partial = await prompt<SpeakerPrompt>([
      {
        type: "input",
        name: "name",
        message: "Speaker full name?",
        required: true
      },
      {
        type: "confirm",
        name: "feature",
        message: "Is a featured speaker?"
      },
      {
        type: "input",
        name: "company",
        message: "Company?",
        required: false
      },
      {
        type: "input",
        name: "city",
        message: "City, Country?",
        required: false
      },
      {
        type: "input",
        name: "photoURL",
        message: "Photo URL? ",
        validate: isUrl,
        required: true
      },
      {
        type: "input",
        name: "twitter",
        message: "Twitter URL? (https://twitter.com/...)",
        required: false,
        validate: isUrl
      },
      {
        type: "input",
        name: "description",
        message: "Description?",
        multiline: true,
        required: true
      }
    ]);
    const key = buildKey(partial.name);

    const { name, company, city, feature, photoURL, description } = partial;
    const socials: Social[] = [];
    if (partial.twitter) {
      socials.push({ icon: "twitter", link: partial.twitter.trim() });
    }

    return {
      key,
      name,
      company,
      city,
      feature,
      photoURL: (photoURL || "").trim(),
      socials,
      description
    };
  }
}
