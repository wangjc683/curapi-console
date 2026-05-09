/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
// Curapi customization: dialog for the channel CREATION flow's "fetch from
// upstream" button — lets the user pick which fetched models to add instead
// of dumping all of them into the field. Mirrors the classic theme's
// 「获取模型列表」UX. Pairs with FetchModelsDialog (which is for the editing
// flow and depends on a saved channel row).
import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type SelectFetchedModelsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  models: string[]
  onConfirm: (selectedModels: string[]) => void
}

export function SelectFetchedModelsDialog({
  open,
  onOpenChange,
  models,
  onConfirm,
}: SelectFetchedModelsDialogProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  // Pre-select everything when the dialog opens — most users want most
  // models, and deselecting a few is faster than selecting many.
  useEffect(() => {
    if (open) {
      setSelected(models)
      setSearch('')
    }
  }, [open, models])

  const filtered = useMemo(() => {
    const kw = search.toLowerCase().trim()
    if (!kw) return models
    return models.filter((model) => model.toLowerCase().includes(kw))
  }, [models, search])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((m) => selected.includes(m))

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelected((prev) => prev.filter((m) => !filtered.includes(m)))
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...filtered])))
    }
  }

  const toggleOne = (model: string) => {
    setSelected((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const handleConfirm = () => {
    onConfirm(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('Select Models to Add')}</DialogTitle>
          <DialogDescription>
            {t('Fetched {{count}} model(s) from upstream', {
              count: models.length,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder={t('Search models...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>
          <div className='bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2 text-sm'>
            <span>
              {t('{{selected}} of {{total}} selected', {
                selected: selected.length,
                total: models.length,
              })}
            </span>
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={toggleAllFiltered}
              disabled={filtered.length === 0}
            >
              {allFilteredSelected ? t('Deselect all') : t('Select all')}
            </Button>
          </div>
          <div className='max-h-[420px] overflow-y-auto rounded-md border'>
            {filtered.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center text-sm'>
                {t('No models match your search')}
              </p>
            ) : (
              <div className='grid grid-cols-1 gap-x-4 gap-y-1 p-2 sm:grid-cols-2'>
                {filtered.map((model) => (
                  <label
                    key={model}
                    className='hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm'
                  >
                    <Checkbox
                      checked={selected.includes(model)}
                      onCheckedChange={() => toggleOne(model)}
                    />
                    <span className='truncate'>{model}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={selected.length === 0}
          >
            {t('Add Selected ({{count}})', { count: selected.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
