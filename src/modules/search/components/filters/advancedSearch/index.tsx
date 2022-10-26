import Divider from '@/common/components/atom/divider';
import { useSearch } from '@/modules/search/hooks/useSearch';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import RadioFilter from './sections/radio';
import SwitchFilter from './sections/switch';

const SliderFilter = dynamic(() => import('./sections/slider'), { ssr: false });

export const AdvancedSearch = ({ className }: { className?: string }) => {
  const { filters } = useSearch();

  if (filters.length === 0) return null;
  return (
    <div className={clsx('flex-col p-5 space-y-3 bg-white rounded-lg shadow-card', className)}>
      {filters.map((item, index) => (
        <div key={item.title} className="flex flex-col space-y-3">
          {item.type === 'radio' && <RadioFilter title={item.title} items={item.items} name={item.name} />}
          {item.type === 'switch' && <SwitchFilter title={item.title} name={item.name} />}
          {item.type === 'slider_with_count' && (
            <SliderFilter
              title={item.title}
              data={item.items.map((item: any) => ({ lable: item.title, count: item.count, value: item.value }))}
              max={item.items.length - 1}
              min={0}
              name={item.name}
            />
          )}
          {index + 1 !== filters.length && <Divider />}
        </div>
      ))}
    </div>
  );
};

export default AdvancedSearch;
