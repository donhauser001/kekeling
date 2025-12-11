import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortableFieldItemProps {
    id: string
    children: React.ReactNode
}

export function SortableFieldItem({ id, children }: SortableFieldItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg border bg-background ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
        >
            <button
                type='button'
                className='cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none'
                {...attributes}
                {...listeners}
            >
                <GripVertical className='h-4 w-4' />
            </button>
            <div className='flex-1'>{children}</div>
        </div>
    )
}
