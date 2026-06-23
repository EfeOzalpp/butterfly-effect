import { houseHasChimney } from '../../../canvas-engine/shapes/house';
import { resolvePowerVisualKind, type PowerVisualKind } from '../../../canvas-engine/shapes/power';
import { makeSpriteSeedKey } from '../internal/spritePolicy';
import type { ShapeKey, SpriteAssignment, SpriteShapeProps } from '../types';

type SunVisualKind = 'sun' | 'moon';

type SpriteRenderedKind = Exclude<ShapeKey, 'power' | 'sun'> | PowerVisualKind | SunVisualKind;

export interface SpriteIdentity {
  shape: ShapeKey;
  renderedKind: SpriteRenderedKind;
  label: string;
  copy: string;
  hasChimney?: boolean;
}

type CopyBand = 'veryLow' | 'low' | 'high' | 'veryHigh';
type ShapeCopyBank = Partial<Record<CopyBand, string>>;

const SHAPE_LABELS: Record<Exclude<ShapeKey, 'power'>, string> = {
  clouds: 'cloud',
  snow: 'snow cloud',
  house: 'house',
  sun: 'sun',
  villa: 'home',
  car: 'car',
  sea: 'pond',
  carFactory: 'workshop',
  bus: 'bus',
  trees: 'tree grove',
};

const SHAPE_COPY: Record<SpriteRenderedKind, ShapeCopyBank> = {
  clouds: {
    veryLow: "You're a cloud. People can't predict you; one moment you pour like there's no tomorrow, next it's all sunshine and rainbows.",
    low: "You're a cloud that used to rain at the right moment. These days it's more of a guess fed by ever-changing conditions; you give a reason to discuss weather.",
    high: "You're a cloud, doing cloudy deeds. You rain and feed the soil - just leave before the plants have had enough.",
    veryHigh: "You're a well-behaved cloud, moving slowly, raining steadily, and people think the soil smells good when you rain.",
  },
  snow: {
    veryLow: "You're a snow cloud, but you don't snow enough for a snowman.",
    low: "You're a snow cloud - enough snow to make a backdrop for a romance movie, not enough to support ecosystems.",
    high: "You're a snow cloud. You would stop schools for a day in the South, but you'd likely stay in the North.",
    veryHigh: "You're a snow cloud, a snow cloud from the 1950s - a nostalgic one, days of steady snow type.",
  },
  house: {
    veryLow: "You're a house, and it seems Santa won't be able to use the chimney. At least, burglars will stay away too.",
    low: "You're a house, comfort zone for many, but the landlord will be angry at the electric costs.",
    high: "You're a house where the thermostat was set once and nobody dared to change it since. Though, it gets the job done.",
    veryHigh: "You're a house; either everyone's out or they're all vampires for how little electricity they use.",
  },
  sun: {
    veryLow: "You're the sun. You're not shaking; the atmosphere is bending your light more than it should.",
    low: "You're the sun, glowing orange through a thick layer of atmosphere.",
    high: "You're the sun, illuminating everything with a bright light. You're too hot for your own good.",
    veryHigh: "You're the sun. Your brightness makes us squint, but we can't do without you. You're hot and cool rather than cooling the world.",
  },
  moon: {
    veryLow: "You're the moon, jittering in a restless sky. Your light seems almost nervous.",
    low: "You're the moon, wobbling in an infinite sky. You are dreamy; your light seems to flicker every now and then.",
    high: "You're the moon, the solace for those that notice the details of the world. When they look at you, all feels calmer.",
    veryHigh: "You're the moon, quiet, steady, anchoring the night in magic. The night feels cozy with clean chill air and you're the star.",
  },
  villa: {
    veryLow: "You're a home where someone's always inside, lights on, and nobody's checked on the garden in a while.",
    low: "You're a home where people overspend on utilities. They don't have to, but life gets distracting and they forget.",
    high: "You're a home where a family lives, but the kids sleep with lights at night. It gets scary...",
    veryHigh: "You're a home that makes you believe the garden has a soul that breathes. The smells are great! That's why everyone's outside usually.",
  },
  car: {
    veryLow: "You're a car with a generous footprint. Your engine roars. You're a cheap thrill, but at least you are cooler than the world you left behind.",
    low: "You're a car for a working-class person who landed an onsite job with a not-so-ideal commute, but they landed a job in 2026 - that's all that matters!",
    high: "You're a car, built with sensibility, but you have to consume diesel to stay alive and you get sluggish when it's cold outside.",
    veryHigh: "You're a car. Your driver is retired and prefers a yacht, so you get to stay in the parking lot most days. At least you've got some other cars to hang out with.",
  },
  sea: {
    veryLow: "You're a pond, spilling. Icebergs used to float over you, now they've all melted into your water. Coastal cities have become Atlantis.",
    low: "You're a pond, holding enough to support everything from seals to sea turtles. One of them lost territory they won't get back. The fish moved south. Water level is elevating.",
    high: "You're a pond. Your tides used to make headlines; people got used to it slowly, now it's just Tuesday.",
    veryHigh: "You're a pond. North or south, upside down or not, you don't spill. Perfectly stable. The weather made sure the icebergs you hold stay icy.",
  },
  carFactory: {
    veryLow: "You're a car factory running at full throttle. The neighborhood tracks your shifts by the noise. Nobody inside is counting anything except units.",
    low: "You're a car factory striving for a balance of quantity and quality. Managers made sacrifices from material to manufacturing. The environment pays for those until the world is in debt.",
    high: "You're a car factory, employees split down the middle. Half advocate for clean manufacturing, costs and all. The other half think polluting is an acceptable tradeoff.",
    veryHigh: "You're a car factory using solar power. You build eco-friendly cars, but you're doing it for the sport of it. Pure class."
  },
  bus: {
    veryLow: "You're a bus. The municipality set you on an empty route with seldom any passengers, yet you roam the streets trying to find them. The occasional passenger is thankful for your service.",
    low: "You're a bus in a bustling city. Traffic got bad enough that people prefer to crowd your interior. The transportation authority got you a brand new air conditioner that'll surely help.",
    high: "You're a bus. Most of your passengers don't own a car, and some take a bike on good days. Although some people own umbrellas, you get crowded when the weather turns bad.",
    veryHigh: "You're a city bus, but you might as well be a sightseeing one. It's a walkable city. People hop on when their feet give out, just to find somewhere new to walk around.",
  },
  trees: {
    veryLow: "You're a resilient tree grove facing drought, scorching asphalt, and a beating sun. You're turning yellow, but the fact that you're holding on is remarkable.",
    low: "You're a somewhat unlucky tree grove. There is a new road being paved right next to you, and you can't exactly pack up and leave. But deep down, you know you'll survive as you always do.",
    high: "You're a tree grove that someone started watering again. You still have that road next door, but you aren't interested in going through that door - not that you can anyway.",
    veryHigh: "You're a green tree grove with no roads cutting through your roots. People come to sit under your canopy, and animals love you.",
  },
  factory: {
    veryLow: "You're a power plant, a stationary old train. Pre-evolution, you would've made the biggest smoker in the village. We've known how to cook for a while now, so we don't need your smoke anymore.",
    low: "You're a power plant, only working part-time. The smoke comes in patterns now. Operator Joe has been sending love letters to Mary from that village on the hill.",
    high: "You're a power plant. Contrary to popular belief, you can get sick. When you do, you sneeze bad particles. Right now, it is mostly harmless vapor. Still, work on that immune system.",
  },
  windTurbine: {
    low: "You're a wind turbine, but someone picked the wrong location. No wind. Ugh.",
    high: "You're a wind turbine people complain about. Plant you a little farther out and you'd have all the room to swing your petals in peace.",
    veryHigh: "You're a wind turbine some kid decided looks like an alien spacecraft. They'll find out later you powered their house. Not bad.",
  },
};

function sentenceForLabel(label: string) {
  return `You're a ${label}.`;
}

function copyBandForAvg(avg: number): CopyBand {
  if (!Number.isFinite(avg)) return 'low';
  if (avg < 0.25) return 'veryLow';
  if (avg < 0.5) return 'low';
  if (avg < 0.75) return 'high';
  return 'veryHigh';
}

function copyForRenderedKind({
  renderedKind,
  label,
  avg,
}: {
  renderedKind: SpriteRenderedKind;
  label: string;
  avg: number;
}) {
  return SHAPE_COPY[renderedKind][copyBandForAvg(avg)] ?? sentenceForLabel(label);
}

function seedKeyForAssignment(assignment: SpriteAssignment) {
  return makeSpriteSeedKey({
    shape: assignment.shape,
    bucketId: assignment.bucketId,
    variant: assignment.variant,
  });
}

export function resolveSpriteIdentity(
  assignment: SpriteAssignment,
  context: Pick<SpriteShapeProps, 'darkMode'> = {}
): SpriteIdentity {
  const seedKey = seedKeyForAssignment(assignment);

  if (assignment.shape === 'power') {
    const renderedKind = resolvePowerVisualKind({
      liveAvg: assignment.bucketAvg,
      seedKey,
    });
    const label = renderedKind === 'windTurbine' ? 'wind turbine' : 'small factory';
    return {
      shape: assignment.shape,
      renderedKind,
      label,
      copy: copyForRenderedKind({
        renderedKind,
        label,
        avg: assignment.sourceAvg ?? assignment.bucketAvg,
      }),
    };
  }

  if (assignment.shape === 'sun') {
    const renderedKind: SunVisualKind = context.darkMode ? 'moon' : 'sun';
    const label = renderedKind;
    return {
      shape: assignment.shape,
      renderedKind,
      label,
      copy: copyForRenderedKind({
        renderedKind,
        label,
        avg: assignment.sourceAvg ?? assignment.bucketAvg,
      }),
    };
  }

  const label = SHAPE_LABELS[assignment.shape];
  const hasChimney = assignment.shape === 'house' ? houseHasChimney(seedKey, assignment.bucketAvg) : undefined;

  return {
    shape: assignment.shape,
    renderedKind: assignment.shape,
    label,
    copy: copyForRenderedKind({
      renderedKind: assignment.shape,
      label,
      avg: assignment.sourceAvg ?? assignment.bucketAvg,
    }),
    hasChimney,
  };
}
