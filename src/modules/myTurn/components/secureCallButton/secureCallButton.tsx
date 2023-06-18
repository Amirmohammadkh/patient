import { useEstablishingSecureCall } from '@/common/apis/services/workflow/establishingSecureCall';
import Button from '@/common/components/atom/button/button';
import { splunkBookingInstance } from '@/common/services/splunk';
import axios from 'axios';
import { toast } from 'react-hot-toast';

type DoctorInfo = {
  name: string;
  centerId: string;
};

type PatientInfo = {
  name: string;
  cell: string;
  nationalCode: string;
};

interface EstablishingSecureCallParams {
  title: string;
  bookId: string;
  eventAction: string;
  referenceCode: string;
  patient: PatientInfo;
  doctor: DoctorInfo;
}

export const SecureCallButton = (props: EstablishingSecureCallParams) => {
  const { bookId, doctor, eventAction, patient, referenceCode, title } = props;
  const establishingSecureCall = useEstablishingSecureCall();
  const handleEstablishingSecureCall = async () => {
    try {
      await establishingSecureCall.mutateAsync({ bookId });
      splunkBookingInstance().sendEvent({
        group: 'safe-call',
        type: 'patient',
        event: {
          action: eventAction,
          referenceCode,
          data: {
            doctor,
            patient,
          },
        },
      });
      toast.success('درخواست شما با موفقیت ثبت شد');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'خطایی رخ داده است');
      }
    }
  };
  return (
    <>
      <Button variant="secondary" onClick={handleEstablishingSecureCall} loading={establishingSecureCall.isLoading} block>
        {title}
      </Button>
    </>
  );
};
