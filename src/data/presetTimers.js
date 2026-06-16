import { resolvePresetImageUrl } from '../lib/presetImages'


function preset(name, totalMinutes, imageKey, notes = '') {
  return { name, totalMinutes, imageKey, imageUrl: resolvePresetImageUrl(imageKey), notes }
}

const TREE_ROUTE =
  'Best Route: Prifddinas Trahaearn patch (Plague\'s End) -> Gnome Stronghold -> Taverley -> Falador Park -> Varrock Castle -> Lumbridge.'

const TREE_PATCH_LOCATIONS =
  'Patch Locations: Prifddinas Trahaearn (Plague\'s End), Gnome Stronghold, Taverley, Falador Park, Varrock Castle, Lumbridge.'

const FRUIT_TREE_ROUTE =
  'Best Route: Meilyr Prifddinas (Plague\'s End) -> Lletya (Lletya access) -> Herblore Habitat (Herblore Habitat access) -> Brimhaven -> Tree Gnome Village -> Gnome Stronghold -> Catherby.'

const FRUIT_TREE_PATCH_LOCATIONS =
  'Patch Locations: Meilyr Prifddinas (Plague\'s End), Lletya (Lletya access), Herblore Habitat (Herblore Habitat access), Brimhaven, west of Tree Gnome Village, Gnome Stronghold, east of Catherby.'

const HERB_ROUTE =
  'Best Route: Wilderness Volcano -> Troll Stronghold roof (My Arm\'s Big Adventure) -> Crwys Prifddinas (Plague\'s End) -> Ardougne north / Manor Farm -> Catherby -> Port Phasmatys -> Falador.'

const HERB_PATCH_LOCATIONS =
  'Patch Locations: Wilderness Volcano, Troll Stronghold roof (My Arm\'s Big Adventure), Crwys Prifddinas (Plague\'s End), north of Ardougne, north of Catherby, west of Port Phasmatys, south of Falador.'

function withRouteNotes(protectionPayment, route, locations) {
  const payment = protectionPayment.replace(/^Protection Payment:\s*/, '')
  const routeStops = route.replace(/^Best Route:\s*/, '').split(' -> ')
  const patchLocations = locations.replace(/^Patch Locations:\s*/, '').split(', ')

  return [
    '## **Protection**',
    `- ${payment}`,
    '',
    '## **Best Route**',
    ...routeStops.map((stop) => `- ${stop}`),
    '',
    '## **Patch Locations**',
    ...patchLocations.map((location) => `- ${location}`),
  ].join('\n')
}

function withPatchNotes(route, locations) {
  const routeStops = route.replace(/^Best Route:\s*/, '').split(' -> ')
  const patchLocations = locations.replace(/^Patch Locations:\s*/, '').split(', ')

  return [
    '## **Best Route**',
    ...routeStops.map((stop) => `- ${stop}`),
    '',
    '## **Patch Locations**',
    ...patchLocations.map((location) => `- ${location}`),
  ].join('\n')
}

function withFoodNotes(foodType, cheapestOptions, extraNotes = []) {
  return [
    '## **Food**',
    `- Eats: ${foodType}`,
    ...extraNotes.map((note) => `- ${note}`),
    '',
    '## **Cheapest Options**',
    ...cheapestOptions.map(({ name, price }) => `- ${name} — ${price.toLocaleString()} gp`),
    '',
    '## **Price Snapshot**',
    '- Weird Gloop RS latest GE snapshot from June 12, 2026.',
  ].join('\n')
}

const POF_FOOD_NOTES = {
  blackDragon: withFoodNotes(
    'Raw meat or raw fish',
    [
      { name: 'Raw tuna', price: 260 },
      { name: 'Raw lobster', price: 281 },
      { name: 'Raw swordfish', price: 286 },
      { name: 'Raw crayfish', price: 409 },
      { name: 'Raw trout', price: 437 },
    ],
  ),
  zygomite: withFoodNotes(
    'Mushrooms',
    [
      { name: 'Fungal algae', price: 802 },
      { name: 'Mort myre fungus', price: 2065 },
      { name: 'Tombshroom', price: 2237 },
      { name: 'Sliced mushrooms', price: 3501 },
      { name: 'Morchella mushroom', price: 8568 },
    ],
  ),
  yak: withFoodNotes(
    'Flowers, fruits, and vegetables',
    [
      { name: 'Woad leaf', price: 20 },
      { name: 'Pineapple', price: 240 },
      { name: 'Cooking apple', price: 297 },
      { name: 'Banana', price: 318 },
      { name: 'Orange', price: 325 },
    ],
  ),
  chinchompa: withFoodNotes(
    'Variety mush',
    [
      { name: 'Woad leaf', price: 20 },
      { name: 'Hammerstone seed', price: 53 },
      { name: 'Asgarnian seed', price: 60 },
      { name: 'Jute seed', price: 61 },
      { name: 'Barley seed', price: 69 },
    ],
    [
      'Requires mixing at least 2 food types in the trough to make **Variety mush**.',
      'Cheap mix example: combine **Woad leaf** with any one cheap seed below.',
    ],
  ),
  frog: withFoodNotes(
    'Bugs',
    [
      { name: 'Stinkfly', price: 729 },
      { name: 'Flies', price: 740 },
      { name: 'Beetle bits', price: 1916 },
    ],
    [
      'Only 3 commonly documented Buggy mush ingredients surfaced in the source data.',
    ],
  ),
  salamander: withFoodNotes(
    'Bugs, flowers, and seeds',
    [
      { name: 'Woad leaf', price: 20 },
      { name: 'Hammerstone seed', price: 53 },
      { name: 'Asgarnian seed', price: 60 },
      { name: 'Jute seed', price: 61 },
      { name: 'Barley seed', price: 69 },
    ],
  ),
}

export const PRESET_TIMER_CATEGORIES = [
  {
    id: 'pof-animals',
    name: 'PoF Animals',
    description: 'Time to elder for PoF and Ranch Out of Time staples.',
    presets: [
      preset('Black Dragon (92)', 168 * 60, 'pof-black-dragon', POF_FOOD_NOTES.blackDragon),
      preset('Zygomite (81)', 84 * 60, 'pof-zygomite', POF_FOOD_NOTES.zygomite),
      preset('Yak (71)', 67.2 * 60, 'pof-yak', POF_FOOD_NOTES.yak),
      preset('Chinchompa (54)', 42 * 60, 'pof-chinchompa', POF_FOOD_NOTES.chinchompa),
      preset('Common Green Frog (42)', 12 * 60, 'pof-frog', POF_FOOD_NOTES.frog),
      preset('Green Salamander (102)', 80 * 60, 'pof-salamander', POF_FOOD_NOTES.salamander),
    ],
  },
  {
    id: 'farming-trees',
    name: 'Farming Trees',
    description: 'Tree patch growth timers for check-health runs.',
    presets: [
      preset('Oak Tree (15)', 140, 'tree-oak', withRouteNotes('Protection Payment: 1 basket of tomatoes.', TREE_ROUTE, TREE_PATCH_LOCATIONS)),
      preset('Willow Tree (30)', 220, 'tree-willow', withRouteNotes('Protection Payment: 1 basket of apples.', TREE_ROUTE, TREE_PATCH_LOCATIONS)),
      preset('Maple Tree (45)', 300, 'tree-maple', withRouteNotes('Protection Payment: 1 basket of oranges.', TREE_ROUTE, TREE_PATCH_LOCATIONS)),
      preset('Yew Tree (60)', 400, 'tree-yew', withRouteNotes('Protection Payment: 10 cactus spines.', TREE_ROUTE, TREE_PATCH_LOCATIONS)),
      preset('Magic Tree (75)', 480, 'tree-magic', withRouteNotes('Protection Payment: 25 coconuts.', TREE_ROUTE, TREE_PATCH_LOCATIONS)),
    ],
  },
  {
    id: 'fruit-trees',
    name: 'Fruit Trees',
    description: 'Fruit tree patch growth timers.',
    presets: [
      preset('Apple Tree (27)', 16 * 60, 'fruit-apple-tree', withRouteNotes('Protection Payment: 9 sweetcorn.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Banana Tree (33)', 16 * 60, 'fruit-apple-tree', withRouteNotes('Protection Payment: 4 baskets of apples.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Orange Tree (39)', 16 * 60, 'fruit-apple-tree', withRouteNotes('Protection Payment: 3 baskets of strawberries.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Curry Tree (42)', 16 * 60, 'fruit-apple-tree', withRouteNotes('Protection Payment: 5 baskets of bananas.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Pineapple Plant (51)', 16 * 60, 'fruit-apple-tree', withRouteNotes('Protection Payment: 10 watermelons.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Papaya Tree (57)', 16 * 60, 'fruit-apple-tree', withRouteNotes('Protection Payment: 10 pineapples.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Palm Tree (68)', 16 * 60, 'fruit-apple-tree', withRouteNotes('Protection Payment: 15 papaya fruit.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Ciku Tree (101)', 800, 'fruit-apple-tree', withRouteNotes('Protection Payment: 6 zygomite fruit.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Guarana Tree (107)', 800, 'fruit-apple-tree', withRouteNotes('Protection Payment: 11 tombshrooms.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
      preset('Carambola Tree (113)', 800, 'fruit-apple-tree', withRouteNotes('Protection Payment: 9 dragonfruit.', FRUIT_TREE_ROUTE, FRUIT_TREE_PATCH_LOCATIONS)),
    ],
  },
  {
    id: 'herbs',
    name: 'Herbs',
    description: 'Herb patch grow times from plant to harvest.',
    presets: [
      preset('Guam (9)', 80, 'herb-guam-seed', withPatchNotes(HERB_ROUTE, HERB_PATCH_LOCATIONS)),
      preset('Ranarr (32)', 80, 'herb-guam-seed', withPatchNotes(HERB_ROUTE, HERB_PATCH_LOCATIONS)),
      preset('Irit (44)', 80, 'herb-guam-seed', withPatchNotes(HERB_ROUTE, HERB_PATCH_LOCATIONS)),
      preset('Avantoe (50)', 80, 'herb-guam-seed', withPatchNotes(HERB_ROUTE, HERB_PATCH_LOCATIONS)),
      preset('Snapdragon (62)', 80, 'herb-guam-seed', withPatchNotes(HERB_ROUTE, HERB_PATCH_LOCATIONS)),
      preset('Torstol (85)', 80, 'herb-guam-seed', withPatchNotes(HERB_ROUTE, HERB_PATCH_LOCATIONS)),
    ],
  },
]

export function formatPresetDuration(totalMinutes) {
  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = totalMinutes % 60
  const segments = []

  if (days > 0) segments.push(`${days}d`)
  if (hours > 0) segments.push(`${hours}h`)
  if (minutes > 0 || segments.length === 0) segments.push(`${minutes}m`)

  return segments.join(' ')
}

export function totalMinutesToFields(totalMinutes) {
  return {
    days: Math.floor(totalMinutes / (24 * 60)),
    hours: Math.floor((totalMinutes % (24 * 60)) / 60),
    minutes: totalMinutes % 60,
  }
}
