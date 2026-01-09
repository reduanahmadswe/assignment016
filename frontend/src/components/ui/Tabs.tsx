'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({ items, defaultTab, variant = 'default', className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  const tabStyles = {
    default: {
      container: 'bg-gray-100 p-1 rounded-lg',
      tab: 'px-4 py-2 rounded-md text-sm font-medium transition-colors',
      active: 'bg-white text-gray-900 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    pills: {
      container: 'flex gap-2',
      tab: 'px-4 py-2 rounded-full text-sm font-medium transition-colors',
      active: 'bg-primary-600 text-white',
      inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    },
    underline: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
      active: 'border-primary-600 text-primary-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
  };

  const styles = tabStyles[variant];

  return (
    <div className={className}>
      <div className={cn('flex', styles.container)}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              styles.tab,
              activeTab === item.id ? styles.active : styles.inactive
            )}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{activeContent}</div>
    </div>
  );
}

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-gray-200 border-t border-b border-gray-200', className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-medium text-gray-900">{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-500 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            {isOpen && (
              <div className="pb-4 text-gray-600 animate-fade-in">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
