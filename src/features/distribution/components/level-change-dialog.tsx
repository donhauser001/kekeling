import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { distributionApi, type DistributionMember } from '@/lib/api'
import { useDistributionLevels } from '../hooks/use-distribution-levels'

interface LevelChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: DistributionMember | null
}

export function LevelChangeDialog({ open, onOpenChange, member }: LevelChangeDialogProps) {
  const queryClient = useQueryClient()
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const { levelOptions } = useDistributionLevels()

  // 当对话框打开时，设置当前等级
  const currentLevel = member?.distributionLevel || 3

  const updateMutation = useMutation({
    mutationFn: (level: number) => distributionApi.updateMemberLevel(member!.id, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-members'] })
      queryClient.invalidateQueries({ queryKey: ['distribution-stats'] })
      toast.success('等级已更新')
      onOpenChange(false)
    },
    onError: (err: any) => {
      toast.error(err.message || '更新失败')
    },
  })

  const handleSubmit = () => {
    if (selectedLevel !== null && selectedLevel !== currentLevel) {
      updateMutation.mutate(selectedLevel)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>调整分销等级</DialogTitle>
          <DialogDescription>
            为 <span className="font-medium">{member.name}</span> 调整分销等级
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={String(selectedLevel ?? currentLevel)}
            onValueChange={(v) => setSelectedLevel(Number(v))}
            className="space-y-3"
          >
            {levelOptions.map((option) => {
              const Icon = option.IconComponent
              return (
                <div key={option.value}>
                  <RadioGroupItem
                    value={String(option.value)}
                    id={`level-${option.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`level-${option.value}`}
                    className="flex items-center gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5" style={{ color: option.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {option.value === currentLevel && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">当前</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        分润比例: {option.commissionRate}%
                      </p>
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              updateMutation.isPending ||
              selectedLevel === null ||
              selectedLevel === currentLevel
            }
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认调整
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
