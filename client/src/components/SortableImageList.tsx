import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { X, GripVertical } from "lucide-react";

interface SortableImageProps {
  id: string;
  url: string;
  isPrimary: boolean;
  onRemove: () => void;
}

function SortableImage({ id, url, isPrimary, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? "scale-105" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-white" />
      </div>
      <img
        src={url}
        alt="Product image"
        className={`w-20 h-20 object-cover rounded-lg border-2 ${
          isPrimary ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
        }`}
        draggable={false}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
        data-testid={`button-remove-image`}
      >
        <X className="w-3 h-3" />
      </button>
      {isPrimary && (
        <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
          Primary
        </span>
      )}
    </div>
  );
}

interface SortableImageListProps {
  images: string[];
  onReorder: (images: string[]) => void;
  onRemove: (index: number) => void;
}

export function SortableImageList({ images, onReorder, onRemove }: SortableImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeUrl = active.id as string;
      const overUrl = over.id as string;
      
      const oldIndex = images.indexOf(activeUrl);
      const newIndex = images.indexOf(overUrl);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(images, oldIndex, newIndex);
        onReorder(newImages);
      }
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images}
        strategy={rectSortingStrategy}
      >
        <div className="flex gap-2 flex-wrap">
          {images.map((url, index) => (
            <SortableImage
              key={url}
              id={url}
              url={url}
              isPrimary={index === 0}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      </SortableContext>
      <p className="text-xs text-muted-foreground mt-2">
        Drag to reorder. First image is the primary display image.
      </p>
    </DndContext>
  );
}
