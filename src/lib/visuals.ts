import {
  VISUAL_ASSET_CATEGORIES,
  VisualAsset,
  VisualAssetCategory,
} from '../types'

export function visualCategoryLabel(category: VisualAssetCategory) {
  return VISUAL_ASSET_CATEGORIES.find((c) => c.key === category)?.label ?? category
}

export function assetsByCategory(assets: VisualAsset[]) {
  return VISUAL_ASSET_CATEGORIES.map((category) => ({
    ...category,
    assets: assets.filter((asset) => asset.category === category.key),
  })).filter((group) => group.assets.length > 0)
}
