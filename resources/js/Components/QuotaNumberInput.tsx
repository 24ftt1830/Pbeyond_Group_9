import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button, Group, Input, NumberField } from 'react-aria-components'

interface QuotaNumberInputProps {
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  className?: string;
  onChange?: (value: number) => void; 
}

const QuotaNumberInput = ({ 
  defaultValue = 0, 
  minValue = 0, 
  maxValue, 
  step = 1, 
  className = "w-full",
  onChange // Destructure it here
}: QuotaNumberInputProps) => {
  return (
    <NumberField 
      defaultValue={defaultValue} 
      minValue={minValue} 
      maxValue={maxValue} 
      step={step} 
      className={className}
      onChange={onChange} 
    >
      <Group className='dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm'>
        <Button
          slot='decrement'
          className='border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <MinusIcon className="size-4" />
          <span className='sr-only'>Decrement</span>
        </Button>
        
        <Input className='selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none bg-transparent font-mono' />
        
        <Button
          slot='increment'
          className='border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <PlusIcon className="size-4" />
          <span className='sr-only'>Increment</span>
        </Button>
      </Group>
    </NumberField>
  )
}

export default QuotaNumberInput