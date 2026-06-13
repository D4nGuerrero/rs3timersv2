import pofDragonImage from '../assets/presets/pof-black-dragon.webp'
import pofZygoImage from '../assets/presets/pof-zygomite.png'
import pofYakImage from '../assets/presets/pof-yak.png'
import pofChinchompaImage from '../assets/presets/pof-chinchompa.png'
import pofGreenFrogImage from '../assets/presets/pof-frog.png'
import pofGreenSalamanderImage from '../assets/presets/pof-salamander.png'
import fruitTreeImage from '../assets/presets/fruit-apple-tree.webp'
import herbImage from '../assets/presets/herb-guam-seed.webp'
import treeYewImage from '../assets/presets/tree-yew.png'
import treeOakImage from '../assets/presets/tree-oak.png'
import treeWillowImage from '../assets/presets/tree-willow.png'
import treeMapleImage from '../assets/presets/tree-maple.png'
import treeMagicImage from '../assets/presets/tree-magic.png'

export const PRESET_IMAGE_URLS = {
  'pof-black-dragon': pofDragonImage,
  'pof-zygomite': pofZygoImage,
  'pof-yak': pofYakImage,
  'pof-chinchompa': pofChinchompaImage,
  'pof-frog': pofGreenFrogImage,
  'pof-salamander': pofGreenSalamanderImage,
  'fruit-apple-tree': fruitTreeImage,
  'herb-guam-seed': herbImage,
  'tree-yew': treeYewImage,
  'tree-oak': treeOakImage,
  'tree-willow': treeWillowImage,
  'tree-maple': treeMapleImage,
  'tree-magic': treeMagicImage,
}

const LEGACY_PRESET_PATH_MAP = {
  'pof-black-dragon.webp': 'pof-black-dragon',
  'pof-zygomite.png': 'pof-zygomite',
  'pof-yak.png': 'pof-yak',
  'pof-chinchompa.png': 'pof-chinchompa',
  'pof-frog.png': 'pof-frog',
  'pof-salamander.png': 'pof-salamander',
  'fruit-apple-tree.webp': 'fruit-apple-tree',
  'herb-guam-seed.webp': 'herb-guam-seed',
  'tree-yew.png': 'tree-yew',
  'tree-oak.png': 'tree-oak',
  'tree-willow.png': 'tree-willow',
  'tree-maple.png': 'tree-maple',
  'tree-magic.png': 'tree-magic',
}

const PRESET_PREFIX = 'preset:'

export function resolvePresetImageUrl(imageKey) {
  return imageKey ? PRESET_IMAGE_URLS[imageKey] ?? '' : ''
}

export function resolveTimerImage(timer) {
  return timer?.imageKey ? resolvePresetImageUrl(timer.imageKey) : timer?.imageUrl?.trim() ?? ''
}

export function parseStoredImage(imageValue = '') {
  const trimmed = imageValue.trim()
  if (!trimmed) return { imageKey: '', imageUrl: '' }

  if (trimmed.startsWith(PRESET_PREFIX)) {
    const imageKey = trimmed.slice(PRESET_PREFIX.length)
    return {
      imageKey,
      imageUrl: '',
    }
  }

  const matchedLegacyKey = Object.entries(LEGACY_PRESET_PATH_MAP).find(([filename]) =>
    trimmed.includes(filename),
  )?.[1]

  if (matchedLegacyKey) {
    return {
      imageKey: matchedLegacyKey,
      imageUrl: '',
    }
  }

  return { imageKey: '', imageUrl: trimmed }
}

export function serializeStoredImage({ imageKey = '', imageUrl = '' }) {
  if (imageKey) return `${PRESET_PREFIX}${imageKey}`
  return imageUrl.trim()
}
