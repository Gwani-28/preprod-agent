import { ChangeEvent, useRef, useState } from 'react'
import {
  AppState,
  VISUAL_ASSET_CATEGORIES,
  VisualAsset,
  VisualAssetCategory,
} from '../types'
import { Card } from '../components/ui/Card'
import { Field, TextArea, TextInput } from '../components/ui/Field'
import { assetsByCategory, visualCategoryLabel } from '../lib/visuals'

interface Props {
  state: AppState
  setAssets: (assets: VisualAsset[]) => void
}

const MAX_IMAGE_SIDE = 1200
const JPEG_QUALITY = 0.76

export function VisualBoard({ state, setAssets }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<VisualAssetCategory>('mood')
  const [isAdding, setIsAdding] = useState(false)
  const groups = assetsByCategory(state.assets)

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    )
    if (files.length === 0) return

    setIsAdding(true)
    try {
      const next: VisualAsset[] = []
      for (const file of files) {
        const dataUrl = await resizeImage(file)
        next.push({
          id: makeId(),
          category,
          title: file.name.replace(/\.[^.]+$/, ''),
          note: '',
          dataUrl,
        })
      }
      setAssets([...state.assets, ...next])
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setIsAdding(false)
      event.target.value = ''
    }
  }

  const updateAsset = (id: string, patch: Partial<VisualAsset>) => {
    setAssets(state.assets.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)))
  }

  const removeAsset = (id: string) => {
    if (!confirm('이 비주얼 자료를 삭제할까요?')) return
    setAssets(state.assets.filter((asset) => asset.id !== id))
  }

  return (
    <div className="space-y-4">
      <Card
        title="비주얼 자료 보드"
        description="무드, 콘티, 로케이션, 캐스팅, 미술, 장비 이미지를 모아 최종 PPM에 넣습니다."
        actions={
          <div className="grid w-full grid-cols-[1fr_auto] gap-2 sm:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VisualAssetCategory)}
              className="min-h-10 rounded border px-2 text-sm"
              aria-label="추가할 이미지 카테고리"
            >
              {VISUAL_ASSET_CATEGORIES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isAdding}
              className="min-h-10 rounded border border-ink-300 bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-white disabled:cursor-wait disabled:opacity-60"
            >
              {isAdding ? '처리 중' : '이미지 추가'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </div>
        }
      >
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {VISUAL_ASSET_CATEGORIES.map((item) => {
            const count = state.assets.filter((asset) => asset.category === item.key).length
            return (
              <div key={item.key} className="rounded border border-ink-700 px-3 py-2">
                <div className="text-[11px] text-ink-400">{item.label}</div>
                <div className="text-lg font-semibold tabular-nums text-ink-100">{count}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {state.assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 px-4 py-10 text-center">
          <p className="text-sm font-medium text-ink-200">아직 추가된 이미지가 없습니다.</p>
          <p className="mt-1 text-xs text-ink-500">
            PPM 예시처럼 무드보드, 로케이션, 콘티 이미지를 먼저 올려두면 산출물이 훨씬 빨리 정리됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key} className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-ink-700 pb-2">
                <h2 className="text-sm font-semibold text-ink-100">{group.label}</h2>
                <span className="text-xs tabular-nums text-ink-500">
                  {group.assets.length}개
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.assets.map((asset) => (
                  <article
                    key={asset.id}
                    className="overflow-hidden rounded-lg border border-ink-700 bg-ink-800/60"
                  >
                    <img
                      src={asset.dataUrl}
                      alt={asset.title || visualCategoryLabel(asset.category)}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="space-y-3 p-3">
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <TextInput
                          value={asset.title}
                          onChange={(e) => updateAsset(asset.id, { title: e.target.value })}
                          placeholder="이미지 제목"
                        />
                        <button
                          type="button"
                          onClick={() => removeAsset(asset.id)}
                          className="min-h-11 rounded border border-ink-700 px-3 text-xs text-ink-300 hover:bg-ink-700"
                        >
                          삭제
                        </button>
                      </div>
                      <Field label="분류">
                        <select
                          value={asset.category}
                          onChange={(e) =>
                            updateAsset(asset.id, {
                              category: e.target.value as VisualAssetCategory,
                            })
                          }
                          className="min-h-11 w-full rounded border px-3 py-2 text-base sm:text-sm"
                        >
                          {VISUAL_ASSET_CATEGORIES.map((item) => (
                            <option key={item.key} value={item.key}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="메모">
                        <TextArea
                          rows={3}
                          value={asset.note}
                          onChange={(e) => updateAsset(asset.id, { note: e.target.value })}
                          placeholder="왜 필요한 이미지인지 적습니다."
                        />
                      </Field>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function makeId() {
  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'))
    reader.onload = () => {
      const raw = String(reader.result ?? '')
      const image = new Image()
      image.onerror = () => reject(new Error('이미지를 처리하지 못했습니다.'))
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('브라우저에서 이미지 변환을 지원하지 않습니다.'))
          return
        }
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      image.src = raw
    }
    reader.readAsDataURL(file)
  })
}
