import { useGetBaseInfo } from '@/common/apis/services/config/baseInfo';
import Button from '@/common/components/atom/button';
import Modal from '@/common/components/atom/modal';
import Text from '@/common/components/atom/text';
import TextField from '@/common/components/atom/textField';
import ChevronIcon from '@/common/components/icons/chevron';
import { useEffect, useRef, useState } from 'react';
import { popularCities } from '../../../../constants/cityList/popularCities';

interface CitySelectProps {
  city: locationParam;
  setCity: (city: locationParam) => void;
}

type locationParam = {
  name: string;
  id: string;
  province_id?: string;
  en_slug: string;
};

export const CitySelect = (props: CitySelectProps) => {
  const { city, setCity } = props;
  const [isOpen, setIsOpen] = useState(false);
  const getCitiesAndProvince = useGetBaseInfo({ table: ['city', 'province'] });
  const [userSearchInput, setUserSearchInput] = useState('');
  const [stepSelect, setStepSelect] = useState<'provinces' | 'cities'>('provinces');
  const provincesData = useRef<locationParam[]>([]);
  const citiesData = useRef<locationParam[]>([]);
  const [filtredLocation, setFiltredLocation] = useState<
    {
      name: string;
      id: string;
      isProvince: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (getCitiesAndProvince.isSuccess) {
      provincesData.current = getCitiesAndProvince.data.data.result.province;
      citiesData.current = getCitiesAndProvince.data.data.result.city;
      setFiltredLocation(provincesData.current.map(item => ({ ...item, isProvince: true })));
    }
  }, [getCitiesAndProvince.status, isOpen]);

  const handleClickProvince = (provinceId: string) => {
    setStepSelect('cities');
    setUserSearchInput('');
    setFiltredLocation(citiesData.current.filter(city => city.province_id === provinceId).map(item => ({ ...item, isProvince: false })));
  };

  const handleClickCity = (cityId: string) => {
    setCity({
      ...citiesData.current.find(item => item.id === cityId),
      id: cityId,
      name: citiesData.current.find(item => item.id === cityId)?.name ?? 'همه ایران',
      en_slug: citiesData.current.find(item => item.id === cityId)?.en_slug ?? '',
    });
    setIsOpen(false);
  };

  const handleBackToProvince = () => {
    setStepSelect('provinces');
  };

  return (
    <>
      <Button
        variant="text"
        icon={
          <svg
            className="fill-slate-700 min-w-min"
            width="20"
            height="20"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>icon</title>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.75586 7.71239C3.75586 5.8741 4.42571 4.55281 5.38422 3.68502C6.3555 2.80567 7.66943 2.35125 9.00586 2.35126C10.3423 2.35126 11.6562 2.80568 12.6275 3.68504C13.586 4.55283 14.2559 5.87412 14.2559 7.71239C14.2559 10.0175 12.9143 12.0608 11.463 13.5839C10.7471 14.3351 10.0289 14.9339 9.48918 15.3448C9.30381 15.486 9.14025 15.6044 9.00602 15.6986C8.87178 15.6043 8.7082 15.4859 8.52281 15.3448C7.98305 14.9339 7.26479 14.3351 6.54889 13.5839C5.09747 12.0608 3.75586 10.0175 3.75586 7.71239ZM8.61163 17.2392C8.61187 17.2394 8.61209 17.2395 9.00603 16.6013L8.61209 17.2395L9.00604 17.4827L9.39999 17.2395L9.00603 16.6013C9.39999 17.2395 9.40021 17.2393 9.40045 17.2392L9.40105 17.2388L9.40265 17.2378L9.40749 17.2348L9.42358 17.2247C9.43711 17.2162 9.45618 17.204 9.48043 17.1884C9.52891 17.157 9.59814 17.1116 9.68516 17.0525C9.8591 16.9344 10.1046 16.7615 10.3978 16.5383C10.9831 16.0927 11.7648 15.4415 12.5489 14.6187C14.0975 12.9936 15.7559 10.5924 15.7559 7.71239C15.7559 5.47659 14.9257 3.74232 13.6342 2.57306C12.3555 1.41537 10.6694 0.851261 9.00586 0.851257C7.34229 0.851253 5.65621 1.41535 4.37749 2.57304C3.086 3.7423 2.25586 5.47658 2.25586 7.71239C2.25586 10.5925 3.91434 12.9936 5.463 14.6187C6.24714 15.4415 7.02892 16.0927 7.6142 16.5383C7.90745 16.7616 8.15295 16.9344 8.3269 17.0525C8.41392 17.1116 8.48316 17.1571 8.53164 17.1884C8.55589 17.204 8.57497 17.2162 8.58849 17.2247L8.60458 17.2348L8.60942 17.2378L8.61103 17.2388L8.61163 17.2392ZM7.50586 7.60128C7.50586 6.77285 8.17743 6.10128 9.00586 6.10128C9.83429 6.10128 10.5059 6.77285 10.5059 7.60128C10.5059 8.42971 9.83429 9.10128 9.00586 9.10128C8.17743 9.10128 7.50586 8.42971 7.50586 7.60128ZM9.00586 4.60128C7.349 4.60128 6.00586 5.94443 6.00586 7.60128C6.00586 9.25813 7.349 10.6013 9.00586 10.6013C10.6627 10.6013 12.0059 9.25813 12.0059 7.60128C12.0059 5.94443 10.6627 4.60128 9.00586 4.60128Z"
            />
          </svg>
        }
        onClick={() => setIsOpen(true)}
        className="!text-slate-700 !px-2 whitespace-nowrap"
      >
        <Text fontSize="sm">{city.name}</Text>
      </Button>
      <Modal title="انتخاب استان/شهر" fullScreen isOpen={isOpen} onClose={setIsOpen}>
        <div className="flex flex-col space-y-3 h-full">
          <div className="flex flex-wrap gap-2">
            {popularCities.map(city => (
              <Button
                key={city.id}
                onClick={() => handleClickCity(city.id)}
                variant="secondary"
                size="sm"
                className="!border-slate-300 font-medium"
              >
                {city.name}
              </Button>
            ))}
          </div>
          <TextField
            size="small"
            placeholder={`جستجو در ${stepSelect === 'provinces' ? 'استان ها' : 'شهر ها'}`}
            onChange={e => setUserSearchInput(e.target.value)}
            value={userSearchInput}
          />

          <div className="flex flex-col overflow-auto h-full pb-32">
            {stepSelect === 'cities' && (
              <div
                className="border-slate-100 sticky top-0 bg-white z-10 hover:bg-slate-50 cursor-pointer p-3 space-s-2  border-b border-solid font-medium flex items-center "
                onClick={handleBackToProvince}
              >
                <ChevronIcon dir="right" />
                <Text fontWeight="bold">برگشت به لیست استان‌ها</Text>
              </div>
            )}
            {filtredLocation
              .filter(item => item.name?.includes(userSearchInput))
              .map(city => (
                <div
                  key={city.id}
                  className="border-slate-100 hover:bg-slate-50 cursor-pointer p-3  border-b border-solid font-medium flex items-center justify-between"
                  onClick={() => (city.isProvince ? handleClickProvince(city.id) : handleClickCity(city.id))}
                >
                  <Text>{city.name}</Text>
                  <ChevronIcon dir="left" />
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
export default CitySelect;
