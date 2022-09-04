import { useAddSubuser } from '@/common/apis/services/auth/subuser/addSubuser';
import { useGetSubuser } from '@/common/apis/services/auth/subuser/getSubuser';
import Button from '@/common/components/atom/button';
import Modal from '@/common/components/atom/modal';
import Skeleton from '@/common/components/atom/skeleton';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import UserCard from '../components/subuser/userCard';
import { PatinetProfileForm } from './form';

export const SubuserList = () => {
  const { data, mutate, isSuccess, isLoading } = useGetSubuser();
  const addSubUser = useAddSubuser();
  const [isOpenAddUserModal, setIsOpenAddUserModal] = useState(false);

  useEffect(() => {
    mutate();
  }, []);

  const handleAddSubuser = async (data: any) => {
    const res = await addSubUser.mutateAsync({
      ...data,
      gender: data.gender?.value,
    });
    if (res.data.status !== 1) {
      if (res.data.details) return Object.values(res.data.details).forEach(item => toast.error(item as string));
      toast.error(res.data.message);
      return;
    }
    mutate();
    setIsOpenAddUserModal(false);
  };
  return (
    <>
      <div className="w-full flex flex-col">
        {isLoading && <SubUserLoading />}{' '}
        {isSuccess &&
          data?.data?.result?.map((item: any) => (
            <UserCard
              key={item.id}
              userId={item.id}
              name={item.name}
              family={item.family}
              cell={item.cell}
              nationalCode={item.national_code}
              gender={item.gender}
              refetchData={mutate}
            />
          ))}
      </div>
      <Button className="self-center" onClick={() => setIsOpenAddUserModal(true)}>
        افزودن کاربر جدید
      </Button>
      <Modal title="کاربر جدید" isOpen={isOpenAddUserModal} onClose={setIsOpenAddUserModal}>
        <PatinetProfileForm
          loading={addSubUser.isLoading}
          onSubmit={handleAddSubuser}
          fields={['NAME', 'FAMILY', 'GENDER', 'NATIONAL_CODE', 'CELL']}
        />
      </Modal>
    </>
  );
};

const SubUserLoading = () => {
  return (
    <div className="space-y-2">
      <Skeleton w="100%" h="6rem" rounded="lg" />
      <Skeleton w="100%" h="6rem" rounded="lg" />
      <Skeleton w="100%" h="6rem" rounded="lg" />
    </div>
  );
};
