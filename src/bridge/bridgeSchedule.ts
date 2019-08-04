import { Slot, SlotKey } from "../site/models/slot";
import { Logger } from "../logger";
import { Time, timePlusDuration } from "../times";

export interface LocalSlot {
  key: SlotKey;
  start: string;
  duration: number;
  weight: number;
}

const logger = Logger.getLogger("bridge.slot");

class MapRow {
  private map = new Map<Time, number>();

  private update(
    time: Time,
    start: number,
    duration: number,
    weight: number
  ): void {
    // start
    if (start === -1) {
      throw new Error(`Invalid start '${start}' for time ${time}`);
    }
    if (!this.map.has(time)) {
      logger.debug(() => `Update start for ${time}`, start);
      this.map.set(time, start);
    } else if (this.map.get(time) !== start) {
      throw new Error(
        `Invalid start '${start}' for time ${time}, should be ${this.map.get(
          time
        )}`
      );
    }
    // end
    const next = timePlusDuration(time, duration);
    const end = start + weight;
    if (!this.map.has(next)) {
      logger.debug(() => `Update end for ${next}`, end);
      this.map.set(next, end);
    } else if (this.map.get(next) !== end) {
      throw new Error(
        `Invalid end '${end}' for time ${next}, should be ${this.map.get(next)}`
      );
    }
  }

  getRowStart(time: Time, duration: number, weight: number): number {
    let start = -1;
    if (this.map.size == 0) {
      logger.trace("no data yet");
      start = 1;
    } else if (this.map.has(time)) {
      const cacheValue = this.map.get(time);
      logger.trace(() => `found cached start for ${time}`, cacheValue);
      start = cacheValue || 1;
    } else {
      const times = Array.from(this.map.keys());
      times.sort();
      logger.trace(
        () => `lookup ${time}`,
        () => times.reduce((acc, elt) => acc + ", " + elt, "")
      );
      start = times.reduce(
        (acc, elt) => (elt < time ? (this.map.get(elt) || 0) + 1 : acc),
        -1
      );
      logger.debug(() => `start not found for ${time}, use`, start);
    }
    this.update(time, start, duration, weight);
    return start;
  }
}

export function toSiteSlot(input: LocalSlot[]): Slot[] {
  const mapRow = new MapRow();

  return input.map(local => {
    const { key, start, duration, weight } = local;
    const rowStart = mapRow.getRowStart(start, duration, weight);
    const end = rowStart + weight;
    return { key, start, duration, row: { start: rowStart, end } };
  });
}
