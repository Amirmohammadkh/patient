import { getFeedbacks } from '@/apis/services/rate/getFeedbacks';
import { ServerStateKeysEnum } from '@/common/apis/serverStateKeysEnum';
import { getProfileData, useGetProfileData } from '@/common/apis/services/profile/getFullProfile';
import { internalLinks, useInternalLinks } from '@/common/apis/services/profile/internalLinks';
import { usePageView } from '@/common/apis/services/profile/pageView';
import Avatar from '@/common/components/atom/avatar/avatar';
import Button from '@/common/components/atom/button';
import Modal from '@/common/components/atom/modal/modal';
import Text from '@/common/components/atom/text/text';
import AddIcon from '@/common/components/icons/add';
import AwardIcon from '@/common/components/icons/award';
import CalenderIcon from '@/common/components/icons/calender';
import ChatIcon from '@/common/components/icons/chat';
import EditIcon from '@/common/components/icons/edit';
import InfoIcon from '@/common/components/icons/info';
import ReceiptIcon from '@/common/components/icons/receipt';
import { LayoutWithHeaderAndFooter } from '@/common/components/layouts/layoutWithHeaderAndFooter';
import Seo from '@/common/components/layouts/seo';
import useCustomize from '@/common/hooks/useCustomize';
import useModal from '@/common/hooks/useModal';
import useResponsive from '@/common/hooks/useResponsive';
import useWebView from '@/common/hooks/useWebView';
import { splunkInstance } from '@/common/services/splunk';
import { CENTERS } from '@/common/types/centers';
import classNames from '@/common/utils/classNames';
import { dayToSecond } from '@/common/utils/dayToSecond';
import getDisplayDoctorExpertise from '@/common/utils/getDisplayDoctorExpertise';
import { removeHtmlTagInString } from '@/common/utils/removeHtmlTagInString';
import scrollIntoViewWithOffset from '@/common/utils/scrollIntoViewWithOffset';
import { useProfileDataStore } from '@/modules/contribute/store/profileData';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { ToolBarItems } from '@/modules/profile/components/head/toolBar';
import EditButton from '@/modules/profile/components/viewAs/editButton';
import { pageViewEvent } from '@/modules/profile/events/pageView';
import { useProfileSplunkEvent } from '@/modules/profile/hooks/useProfileEvent';
import { useToolBarController } from '@/modules/profile/hooks/useToolBarController';
import { useFeedbackDataStore } from '@/modules/profile/store/feedbackData';
import Activity from '@/modules/profile/views/activity';
import Head from '@/modules/profile/views/head/head';
import RateReview from '@/modules/profile/views/rateReview';
import ProfileSeoBox from '@/modules/profile/views/seoBox';
import Services from '@/modules/profile/views/services';
import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import config from 'next/config';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { QueryClient, dehydrate } from 'react-query';
const CentersInfo = dynamic(() => import('@/modules/profile/views/centersInfo'));
const Gallery = dynamic(() => import('@/modules/profile/views/gallery'));
const Biography = dynamic(() => import('@/modules/profile/views/biography'));

const { publicRuntimeConfig } = config();

const DoctorProfile = ({ query: { university }, initialFeedbackDate, feedbackDataWithoutPagination }: any) => {
  useFeedbackDataStore.getState().data = initialFeedbackDate;

  const { query, ...router } = useRouter();
  const { customize } = useCustomize();
  const addPageView = usePageView();
  const slug = query.slug as string;
  const [servicesRef, inViewServices] = useInView({
    initialInView: true,
  });
  const { handleOpen: handleOpenBeenBeforeModal, handleClose: handleCloseBeenBeforeModal, modalProps: beenBeforeModalProps } = useModal();
  const { handleOpen: handleOpenViewAsModal, handleClose: handleCloseViewAsModal, modalProps: viewAsModalProps } = useModal();
  const [viewAdData, setViewAsData] = useState({ title: '', url: '' });
  const [rateRef, inViewRate] = useInView();
  const { isMobile, isDesktop } = useResponsive();
  const isLogin = useUserInfoStore(state => state.isLogin);
  const userInfo = useUserInfoStore(state => state.info);
  const setProfileData = useProfileDataStore(state => state.setData);
  const sendRateTriggered = useRef(false);
  const { rateSplunkEvent, recommendEvent } = useProfileSplunkEvent();
  const isWebView = useWebView();
  const [editable, setEditable] = useState(false);
  const profile = useGetProfileData(
    { slug, ...(university && { university }) },
    {
      keepPreviousData: true,
    },
  );
  const profileData = profile.data?.data;
  const internalLinks = useInternalLinks(
    { links: getSearchLinks({ ...profileData }) },
    {
      refetchOnMount: false,
    },
  );
  const isBulk = useMemo(
    () =>
      profileData?.centers?.every((center: any) => center.status === 2) ||
      profileData?.centers?.every((center: any) => center.services.every((service: any) => !service.hours_of_work)),
    [profileData],
  );

  useEffect(() => {
    if (inViewRate && !sendRateTriggered.current) {
      sendRateTriggered.current = true;
      return rateSplunkEvent('scroll To doctor feedbacks box');
    }
  }, [inViewRate]);

  useEffect(() => {
    if (profileData) {
      pageViewEvent({
        doctor: profileData,
        isBulk,
        isWebView: !!isWebView,
      });
      addPageView.mutate({
        doctorId: profileData.id,
        serverId: profileData.server_id,
      });
      setProfileData(profileData);
      window.doctor = profileData;
      if (document.referrer.includes('google.') && !getCookie('isBeenBefore')) {
        handleOpenBeenBeforeModal();
        setCookie('isBeenBefore', true, {
          maxAge: dayToSecond(60),
          path: '/',
        });
      }
      if (profileData.should_recommend_other_doctors) recommendEvent('loadrecommend');
    }
  }, [profileData, isBulk]);

  useEffect(() => {
    if (!!userInfo.is_doctor && slug === userInfo?.profile?.slug) {
      setEditable(true);
      splunkInstance().sendEvent({
        group: 'profile',
        type: 'view-as',
        event: {
          action: 'page-view',
          doctor: profileData.display_name,
          slug,
          terminal_id: getCookie('terminal_id'),
        },
      });
    }
  }, [userInfo, slug]);

  useEffect(() => {
    // Prefetch the booking page
    router.prefetch('/booking/[slug]');
  }, []);

  const doctorExpertise = getDisplayDoctorExpertise({
    aliasTitle: profileData?.expertises?.[0]?.alias_title,
    degree: profileData?.expertises?.[0]?.degree?.name,
    expertise: profileData?.expertises?.[0]?.expertise?.name,
  });
  const doctorCity = profileData?.centers?.find((center: any) => center.id !== '5532')?.city;
  const documentTitle = `${profileData?.display_name}، ${doctorExpertise} ${
    doctorCity ? `${doctorCity}،` : ''
  } نوبت دهی آنلاین و شماره تلفن`;
  const ducmentDescription = `نوبت دهی اینترنتی ${profileData?.display_name}، آدرس مطب، شماره تلفن و اطلاعات تماس با امکان رزرو وقت و نوبت دهی آنلاین در اپلیکیشن و سایت پذیرش۲۴`;

  const toolBarItems = useToolBarController({ slug, displayName: profileData?.display_name, documentTitle, editable });
  const layout: {
    content: Record<string, ({ doctor }: { doctor: any }) => ReactElement | null>;
    sideBar: Record<string, ({ doctor }: { doctor: any }) => ReactElement | null>;
  } = useMemo(
    () => ({
      content: {
        Services: ({ doctor }) => (
          <div id="services_section" ref={servicesRef} className="flex flex-col space-y-3 md:hidden">
            <Services className="md:hidden" doctor={doctor} isBulk={isBulk} slug={slug} />
          </div>
        ),
        CenterInfo: ({ doctor }) => {
          if (doctor.centers.filter((center: any) => center.id !== CENTERS.CONSULT)?.length === 0) return null;
          return (
            <div id="center-info_section" className="flex flex-col space-y-3 md:hidden">
              <Text as="h2" fontWeight="bold" className="px-4 md:px-0">
                آدرس و تلفن تماس
              </Text>
              <CentersInfo
                className="bg-white md:rounded-lg"
                centers={profileData.centers
                  .filter((center: any) => center.id !== CENTERS.CONSULT)
                  .map((center: any) => ({
                    id: center.id,
                    address: center.address,
                    city: center.city,
                    slug: center.center_type === 1 ? `/dr/${slug}` : `/center/${center.slug}`,
                    description: center.description,
                    phoneNumbers: center?.display_number_array,
                    name: center.center_type !== 1 ? center.name : `مطب ${doctor?.display_name}`,
                    location: center.map,
                  }))}
                onEventPhoneNumber={centerId => {
                  const center = doctor.centers.find((center: any) => center.id === centerId);
                  splunkInstance().sendEvent({
                    group: 'doctor profile',
                    type: 'see center phone',
                    event: {
                      data: {
                        doctor: {
                          name: doctor.name,
                          family: doctor.family,
                          server_id: doctor.server_id,
                          slug,
                          id: doctor.id,
                          expertise: doctor.expertises[0].expertise.name,
                          group_expertise: doctor.group_expertises[0].name,
                        },
                        center: {
                          center_status: center?.status,
                          center_type: center?.center_type,
                          center_name: center?.name,
                          city_en_slug: center?.city_en_slug,
                        },
                        user: {
                          terminal_id: getCookie('terminal_id'),
                          cell: userInfo.cell,
                        },
                      },
                    },
                  });
                }}
                onEventAddress={centerId => {
                  const center = doctor.centers.find((center: any) => center.id === centerId);
                  splunkInstance().sendEvent({
                    group: 'doctor profile',
                    type: 'see center map',
                    event: {
                      data: {
                        doctor: {
                          name: doctor.name,
                          family: doctor.family,
                          server_id: doctor.server_id,
                          slug,
                          id: doctor.id,
                          expertise: doctor.expertises[0].expertise.name,
                          group_expertise: doctor.group_expertises[0].name,
                        },
                        center: {
                          center_status: center?.status,
                          center_type: center?.center_type,
                          center_name: center?.name,
                          city_en_slug: center?.city_en_slug,
                        },
                        user: {
                          terminal_id: getCookie('terminal_id'),
                          cell: userInfo.cell,
                        },
                      },
                    },
                  });
                }}
              />
            </div>
          );
        },
        OwnPage: ({ doctor }) => {
          if (!isBulk) return null;
          return (
            <div className="flex flex-col p-4 space-y-3 bg-white md:rounded-lg">
              <Text fontWeight="medium">درخواست احراز هویت و دریافت مالکیت صفحه</Text>
              <Button
                onClick={() => {
                  splunkInstance().sendEvent({
                    group: 'register',
                    type: 'doctor-profile',
                    event: {
                      data: {
                        action: 'click',
                        current_url: location.href,
                        phone_number: isLogin ? userInfo.cell : null,
                      },
                    },
                  });
                  location.assign('https://dr.paziresh24.com/auth/?q=profile');
                }}
                variant="secondary"
              >
                من {doctor.display_name} هستم
              </Button>
            </div>
          );
        },
        Biography: ({ doctor }) => {
          const { biography, awards, scientific } = doctor;
          if (!biography && !awards && !scientific && !editable) return null;
          return (
            <div id="about_section" className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-4 md:px-0">
                <Text as="h2" fontWeight="bold">
                  درباره پزشک
                </Text>
                {editable && biography && <EditButton onClick={() => handleViewAs('biography')} />}
              </div>

              {!biography && !awards && !scientific && editable && (
                <div
                  onClick={() => handleViewAs('biography')}
                  className="flex items-center justify-center p-5 mx-4 transition-all border-2 border-dashed rounded-lg cursor-pointer md:mx-0 hover:bg-slate-200/30 space-s-2 text-slate-400 border-slate-200"
                >
                  <AddIcon className="w-5 h-5" />
                  <Text fontWeight="medium">نوشتن بیوگرافی</Text>
                </div>
              )}
              {(biography || awards || scientific) && (
                <Biography {...{ biography, awards, scientific }} className="bg-white md:rounded-lg" />
              )}
            </div>
          );
        },
        Video: ({ doctor: { aparat_video_code } }) => {
          if (!aparat_video_code || aparat_video_code === '0') return null;
          return <div className="overflow-hidden md:rounded-lg" dangerouslySetInnerHTML={{ __html: aparat_video_code }} />;
        },
        Gallery: ({ doctor }) => {
          const items = doctor.centers.find((center: any) => center.center_type === 1)?.gallery ?? [];
          const reformmatedItems = items?.map((item: any) => publicRuntimeConfig.CLINIC_BASE_URL + item.image) ?? [];
          if (!customize.showGalleryProfile) return null;
          if (!items?.length && !editable && !doctor.centers.some((center: any) => center.center_type === 1)) return null;
          return (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-4 md:px-0">
                <Text as="h2" fontWeight="bold">
                  گالری
                </Text>
                {editable && items?.length > 0 && <EditButton onClick={() => handleViewAs('gallery')} />}
              </div>
              {items?.length === 0 && editable && (
                <div
                  onClick={() => handleViewAs('gallery')}
                  className="flex items-center justify-center p-5 mx-4 transition-all border-2 border-dashed rounded-lg cursor-pointer md:mx-0 hover:bg-slate-200/30 space-s-2 text-slate-400 border-slate-200"
                >
                  <AddIcon className="w-5 h-5" />
                  <Text fontWeight="medium">افزودن تصویر</Text>
                </div>
              )}
              {items?.length > 0 && <Gallery items={reformmatedItems} className="bg-white md:rounded-lg" />}
            </div>
          );
        },
        Activity: ({ doctor }) => {
          if (!customize.showActivityProfile) return null;
          return (
            <div className="flex flex-col space-y-3">
              <Text as="h2" fontWeight="bold" className="px-4 md:px-0">
                فعالیت ها {doctor.display_name}
              </Text>
              <Activity
                className="bg-white md:rounded-lg"
                items={[
                  doctor.followConsultBoosk && {
                    icon: <ChatIcon className="min-w-fit w-max" />,
                    text: `<b>${doctor.followConsultBoosk}</b> مشاوره فعال`,
                  },
                  {
                    icon: <AwardIcon className="min-w-fit w-max" />,
                    text: `پذیرش24 بیش از ${doctor.insert_at_age} افتخار میزبانی از صفحه اختصاصی ${doctor.display_name} را داشته است.`,
                  },
                ].filter(Boolean)}
              />
            </div>
          );
        },
        RateReview: ({ doctor }) => {
          if (!customize.showRateAndReviews) return null;

          const doctorInfo = {
            center: doctor.centers
              .filter((center: any) => center.id !== '5532')
              .map((center: any) => center && { id: center.id, name: center.name }),
            id: doctor.id,
            name: doctor.display_name,
            image: doctor.image,
            group_expertises: doctor.group_expertises[0].name ?? 'سایر',
            group_expertises_slug: doctor.group_expertises[0].en_slug ?? 'other',
            expertise: doctor?.expertises?.[0]?.expertise?.name,
            slug: doctor.slug,
            city: doctor.centers.map((center: any) => center.city),
          };
          const doctorRateDetails = {
            satisfaction: doctor.feedbacks.details.satisfaction,
            count: doctor.feedbacks.details.number_of_feedbacks,
            information: [
              {
                id: 1,
                title: 'برخورد مناسب پزشک',
                satisfaction: doctor.feedbacks.details.doctor_encounter * 20,
                avg_star: doctor.feedbacks.details.doctor_encounter,
              },
              {
                id: 2,
                title: 'توضیح پزشک در هنگام ویزیت',
                satisfaction: doctor.feedbacks.details.explanation_of_issue * 20,
                avg_star: doctor.feedbacks.details.explanation_of_issue,
              },
              {
                id: 3,
                title: 'مهارت و تخصص پزشک',
                satisfaction: doctor.feedbacks.details.quality_of_treatment * 20,
                avg_star: doctor.feedbacks.details.quality_of_treatment,
              },
            ],
          };
          return (
            <div id="reviews_section" className="flex flex-col space-y-3" ref={rateRef}>
              <Text fontWeight="bold" className="px-4 md:px-0">
                نظرات در مورد {doctor.display_name}
              </Text>
              <RateReview doctor={doctorInfo} serverId={doctor.server_id} rateDetails={doctorRateDetails} className="md:rounded-lg" />
            </div>
          );
        },
        ProfileSeoBox: ({ doctor }) => {
          if (!customize.showSeoBoxs) return null;
          return (
            <ProfileSeoBox
              similarLinks={doctor.similar_links?.map((item: any) => ({ name: item.caption, url: item.link }))}
              about={`این صفحه به عنوان وب سایت نوبت دهی اینترنتی ${
                doctor.display_name
              } جهت مشاهده خدمات و دریافت نوبت آنلاین مطب شخصی، کلینیک، درمانگاه و بیمارستان هایی که ایشان در حال ارائه خدمات درمانی هستند از طریق پذیرش24 طراحی و ارائه شده است. البته ممکن است در حال حاضر امکان رزرو نوبت از همه مراکز فوق ممکن نباشد که این موضوع وابسته به تصمیم ${
                doctor.gender === 0 ? '' : doctor.gender == 1 ? 'آقای' : 'خانم'
              } دکتر در ارائه نوبت گیری از درگاه های فوق بوده است.`}
              breadcrumbs={createBreadcrumb(internalLinks?.data, doctor.display_name, router.asPath)}
            />
          );
        },
      },
      sideBar: {
        Services: ({ doctor }) => {
          return (
            <div className="flex-col hidden w-full space-y-3 md:flex">
              <Services doctor={doctor} isBulk={isBulk} slug={slug} />
            </div>
          );
        },
        CenterInfo: ({ doctor }) => {
          if (doctor.centers.filter((center: any) => center.id !== CENTERS.CONSULT)?.length === 0) return null;
          return (
            <div className="flex-col hidden space-y-3 md:flex">
              <div className="flex items-center justify-between">
                <Text as="h2" fontWeight="bold" className="px-4 md:px-0">
                  آدرس و تلفن تماس
                </Text>
                {customize.showContribute && !editable && (
                  <Link href={`/patient/contribute/?slug=${slug}&test_src=profile_eslah`}>
                    <Button variant="text" size="sm" className="flex text-xs font-semibold h-9 gap-x-1 text-primary">
                      <EditIcon width={17} height={17} />
                      گزارش تلفن و آدرس صحیح
                    </Button>
                  </Link>
                )}
              </div>
              <CentersInfo
                className="bg-white md:rounded-lg"
                centers={profileData.centers
                  .filter((center: any) => center.id !== CENTERS.CONSULT)
                  .map((center: any) => ({
                    id: center.id,
                    address: center.address,
                    city: center.city,
                    slug: center.center_type === 1 ? `/dr/${slug}` : `/center/${center.slug}`,
                    description: center.description,
                    phoneNumbers: center?.display_number_array,
                    name: center.center_type !== 1 ? center.name : `مطب ${doctor?.display_name}`,
                    location: center.map,
                  }))}
                onEventPhoneNumber={centerId => {
                  const center = doctor.centers.find((center: any) => center.id === centerId);
                  splunkInstance().sendEvent({
                    group: 'doctor profile',
                    type: 'see center phone',
                    event: {
                      data: {
                        doctor: {
                          name: doctor.name,
                          family: doctor.family,
                          server_id: doctor.server_id,
                          slug,
                          id: doctor.id,
                          expertise: doctor.expertises[0].expertise.name,
                          group_expertise: doctor.group_expertises[0].name,
                        },
                        center: {
                          center_status: center?.status,
                          center_type: center?.center_type,
                          center_name: center?.name,
                          city_en_slug: center?.city_en_slug,
                        },
                        user: {
                          terminal_id: getCookie('terminal_id'),
                          cell: userInfo.cell,
                        },
                      },
                    },
                  });
                }}
                onEventAddress={centerId => {
                  const center = doctor.centers.find((center: any) => center.id === centerId);
                  splunkInstance().sendEvent({
                    group: 'doctor profile',
                    type: 'see center map',
                    event: {
                      data: {
                        doctor: {
                          name: doctor.name,
                          family: doctor.family,
                          server_id: doctor.server_id,
                          slug,
                          id: doctor.id,
                          expertise: doctor.expertises[0].expertise.name,
                          group_expertise: doctor.group_expertises[0].name,
                        },
                        center: {
                          center_status: center?.status,
                          center_type: center?.center_type,
                          center_name: center?.name,
                          city_en_slug: center?.city_en_slug,
                        },
                        user: {
                          terminal_id: getCookie('terminal_id'),
                          cell: userInfo.cell,
                        },
                      },
                    },
                  });
                }}
              />
            </div>
          );
        },
      },
    }),
    [isDesktop, isMobile, profileData, editable],
  );

  const getJsonlds = () => {
    const center = profileData.centers.find((cn: any) => cn.id !== '5532');
    const date = new Date();

    return [
      {
        '@context': 'http://www.schema.org',
        '@type': 'Physician',
        'priceRange': '$$',
        'name': profileData.display_name,
        'telephone': center?.display_number,
        'description': profileData?.biography ? removeHtmlTagInString(profileData.biography) : '',
        'image': publicRuntimeConfig.CLINIC_BASE_URL + profileData.image,
        'isAcceptingNewPatients': true,
        'medicalSpecialty': !profileData?.group_expertises ? profileData.group_expertises?.[0]?.name : doctorExpertise,
        'duns': profileData?.medical_code,
        'url': publicRuntimeConfig.CLINIC_BASE_URL + router.asPath,
        'address': {
          '@type': 'PostalAddress',
          'addressCountry': {
            '@type': 'Country',
            'name': 'IRN',
          },
          'addressLocality': center?.city,
          'addressRegion': center?.province,
          'streetAddress': center?.address,
        },
        ...(feedbackDataWithoutPagination.length > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            'bestRating': 5,
            'worstRating': 0,
            'ratingValue': profileData.feedbacks.details.avg_star,
            'ratingCount': profileData.feedbacks.details.number_of_feedbacks,
          },
        }),
        'review':
          feedbackDataWithoutPagination?.map((item: any) => ({
            '@type': 'Review',
            'author': {
              '@type': 'Person',
              'name': item.user_name,
            },
            'description': item.description,
            'reviewRating': {
              '@type': 'Rating',
              'bestRating': 5,
              'worstRating': 0,
              'datePublished': `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`,
              'ratingValue': item.avg_star === '0.0' || item.avg_star === 0.0 ? '0.5' : item.avg_star,
            },
          })) ?? [],
      },
      {
        '@context': 'http://www.schema.org',
        '@type': 'Person',
        'jobTitle': 'physician',
        'name': profileData.display_name,
        'telephone': center?.display_number,
        'image': publicRuntimeConfig.CLINIC_BASE_URL + profileData.image,
        'url': publicRuntimeConfig.CLINIC_BASE_URL + router.asPath,
        'address': {
          '@type': 'PostalAddress',
          'addressCountry': {
            '@type': 'Country',
            'name': 'IRN',
          },
          'addressLocality': center?.city,
          'addressRegion': center?.province,
          'streetAddress': center?.address,
        },
      },
      {
        '@context': 'http://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'item': {
              '@id': `${publicRuntimeConfig.CLINIC_BASE_URL}/`,
              'name': 'پذیرش۲۴',
            },
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'item': {
              '@id': publicRuntimeConfig.CLINIC_BASE_URL + router.asPath,
              'name': profileData.display_name,
            },
          },
        ],
      },
    ];
  };

  const handleViewAs = (key: 'information' | 'gallery' | 'biography' | 'services' | 'workHours') => {
    const views = {
      information: {
        title: 'ویرایش اطلاعات فردی',
        url: '/profile/info?isWebView=1&secretary_phone=off&biography=off&sticky=on',
      },
      biography: {
        title: 'ویرایش توضیحات و بیوگرافی',
        url: '/profile/biography?isWebView=1&sticky=on',
      },
      services: {
        title: 'ویرایش تخصص',
        url: '/profile/expertises?isWebView=1&sticky=on',
      },
      gallery: {
        title: 'ویرایش تصاویر گالری',
        url: '/profile/gallery?isWebView=1',
      },
      workHours: {
        title: 'ویرایش ساعت کاری',
        url: '/setting/workhours?isWebView=1&sticky=on',
      },
    };
    setViewAsData({
      ...views[key],
    });
    splunkInstance().sendEvent({
      group: 'profile',
      type: 'view-as',
      event: {
        action: `click-${key}`,
        doctor: profileData.display_name,
        slug,
        terminal_id: getCookie('terminal_id'),
      },
    });
    handleOpenViewAsModal();
  };

  return (
    <>
      <Seo
        title={documentTitle}
        description={ducmentDescription}
        jsonlds={getJsonlds()}
        openGraph={{
          image: {
            src: publicRuntimeConfig.CLINIC_BASE_URL + profileData?.image,
            alt: profileData?.display_name,
            type: 'image/jpg',
          },
        }}
      />
      <div className="flex flex-col items-start max-w-screen-xl mx-auto md:flex-row space-s-0 md:space-s-5 md:py-10">
        <div className="flex flex-col w-full space-y-3 md:basis-7/12">
          {editable && (
            <div className="flex items-center p-2 -mb-3 bg-slate-200 md:mb-0 md:rounded-md text-slate-600 space-s-1">
              <InfoIcon className="min-w-6" />
              <Text fontSize="sm" fontWeight="medium">
                پزشک گرامی؛ تغییرات شما بعد از <strong className="font-bold">2 ساعت</strong> در پروفایل نمایش داده می‌شود.
              </Text>
            </div>
          )}
          <Head
            pageViewCount={profileData?.number_of_visits}
            displayName={profileData?.display_name}
            image={publicRuntimeConfig.CLINIC_BASE_URL + profileData?.image}
            title={profileData?.experience ? `${profileData?.experience} سال تجربه` : undefined}
            subTitle={`شماره نظام پزشکی: ${profileData?.medical_code}`}
            serviceList={profileData?.expertises?.map(({ alias_title, degree, expertise }: any) =>
              getDisplayDoctorExpertise({
                aliasTitle: alias_title,
                degree: degree.name,
                expertise: expertise.name,
              }),
            )}
            toolBarItems={toolBarItems as ToolBarItems}
            className="w-full shadow-card md:rounded-lg"
            satisfaction={customize.showRateAndReviews && profileData.feedbacks?.details?.satisfaction}
            rateCount={profileData.feedbacks?.details?.number_of_feedbacks}
            editable={editable}
            servicesEditAction={() => handleViewAs('services')}
            infoEditAction={() => handleViewAs('information')}
          >
            {editable && (
              <div className="flex mx-4 space-s-2">
                <Button
                  size="sm"
                  icon={<ReceiptIcon className="w-6 h-6" />}
                  onClick={() => {
                    window.open(publicRuntimeConfig.DOCTOR_APP_BASE_URL);
                    splunkInstance().sendEvent({
                      group: 'profile',
                      type: 'view-as',
                      event: {
                        action: `click-list`,
                        doctor: profileData.display_name,
                        slug,
                        terminal_id: getCookie('terminal_id'),
                      },
                    });
                  }}
                >
                  لیست مراجعین
                </Button>
                <Button size="sm" variant="secondary" icon={<CalenderIcon className="w-6 h-6" />} onClick={() => handleViewAs('workHours')}>
                  ساعت کاری
                </Button>
              </div>
            )}
          </Head>
          <nav className="md:hidden p-4 px-6 shadow-card border-t border-slate-100 sticky top-0 z-50 !mt-0 bg-white flex justify-around">
            <div onClick={() => scrollIntoViewWithOffset('#services_section', 90)}>
              <Text fontSize="sm" fontWeight="medium">
                دریافت نوبت
              </Text>
            </div>
            <div onClick={() => scrollIntoViewWithOffset('#center-info_section', 90)}>
              <Text fontSize="sm" fontWeight="medium">
                آدرس و تلفن
              </Text>
            </div>
            <div onClick={() => scrollIntoViewWithOffset('#about_section', 90)}>
              <Text fontSize="sm" fontWeight="medium">
                درباره پزشک
              </Text>
            </div>
            <div onClick={() => scrollIntoViewWithOffset('#reviews_section', 90)}>
              <Text fontSize="sm" fontWeight="medium">
                نظرات
              </Text>
            </div>
          </nav>
          {profileData && Object.entries(layout.content).map(([key, Component]) => <Component key={key} doctor={profileData} />)}
        </div>

        <div className="flex flex-col w-full space-y-3 overflow-hidden md:basis-5/12">
          {profileData && Object.entries(layout.sideBar).map(([key, Component]) => <Component key={key} doctor={profileData} />)}
        </div>
        {isMobile && !inViewServices && (
          <div
            className={classNames('fixed z-50 w-full p-3 bg-white border-t bottom-16 shadow-card border-slate-100', {
              'bottom-0': isWebView,
            })}
          >
            <Button onClick={() => scrollIntoViewWithOffset('#services_section', 90)} block>
              دریافت نوبت
            </Button>
          </div>
        )}
      </div>
      <Modal noHeader {...beenBeforeModalProps} bodyClassName="space-y-4 flex flex-col items-center">
        <Avatar src={publicRuntimeConfig.CLINIC_BASE_URL + profileData?.image} width={90} height={90} />
        <Text fontWeight="semiBold">آیا تاکنون توسط {profileData.display_name} ویزیت شده‌اید؟</Text>
        <div className="flex w-full space-s-3">
          <Button
            block
            onClick={() =>
              window.location.assign(
                `https://www.paziresh24.com/comment/?doctorName=${profileData.display_name}&image=${profileData.image}&group_expertises=${
                  profileData?.group_expertises?.[0]?.name ?? 'سایر'
                }&group_expertises_slug=${profileData?.group_expertises?.[0]?.en_slug ?? 'other'}&expertise=${
                  profileData?.expertises?.[0]?.expertise?.name
                }&doctor_id=${profileData.id}&server_id=${profileData.serverId}&doctor_city=${
                  profileData.centers.find((center: any) => center.city)[0]
                }&doctor_slug=${profileData.slug}`,
              )
            }
          >
            بله
          </Button>
          <Button variant="secondary" block onClick={handleCloseBeenBeforeModal}>
            خیر
          </Button>
        </div>
      </Modal>
      <Modal {...viewAsModalProps} title={viewAdData?.title ?? ''} fullScreen bodyClassName="p-0">
        <iframe src={`${publicRuntimeConfig.DOCTOR_APP_BASE_URL}${viewAdData?.url}`} className="w-full h-full" />
      </Modal>
    </>
  );
};

const getSearchLinks = ({ centers, group_expertises }: any) => {
  const center = centers.find((center: any) => center.city && center.id !== '5532');
  const gexp = group_expertises[0];
  return ['/s/', ...(center?.city ? [`/s/${center.city_en_slug}/`, `/s/${center.city_en_slug}/${gexp.en_slug}/`] : [])];
};

const createBreadcrumb = (links: { orginalLink: string; title: string }[], displayName: string, currentPathName: string) => {
  const reformmatedBreadcrumb = links?.map(link => ({ href: link.orginalLink, text: link.title })) ?? [];

  reformmatedBreadcrumb.unshift({
    href: '/',
    text: 'پذیرش۲۴',
  });

  reformmatedBreadcrumb.push({
    href: currentPathName,
    text: displayName,
  });

  return reformmatedBreadcrumb;
};

DoctorProfile.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutWithHeaderAndFooter showSearchSuggestionButton={true} shouldShowPromoteApp={false} {...page.props.config}>
      {page}
    </LayoutWithHeaderAndFooter>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const isCSR = context.req.url?.startsWith?.('/_next');

  const { slug, ...query } = context.query;
  const university = query.university as string;

  const slugFormmated = decodeURIComponent(slug as string);
  try {
    const queryClient = new QueryClient();
    const { data, redirect } = await queryClient.fetchQuery(
      [
        ServerStateKeysEnum.DoctorFullProfile,
        {
          slug: slugFormmated,
          ...(university && { university }),
        },
      ],
      () =>
        getProfileData({
          slug: slugFormmated,
          ...(university && { university }),
        }),
    );

    if (redirect) {
      return {
        redirect: {
          statusCode: redirect.statusCode,
          destination: encodeURI(redirect.route),
        },
      };
    }

    const links = getSearchLinks({ centers: data.centers, group_expertises: data.group_expertises });

    try {
      await queryClient.fetchQuery(
        [
          ServerStateKeysEnum.InternalLinks,
          {
            links,
          },
        ],
        () =>
          internalLinks({
            links,
          }),
      );
    } catch (error) {
      console.log(error);
    }
    let feedbackDataWithoutPagination;

    try {
      const feedbackData = await queryClient.fetchQuery(
        [
          ServerStateKeysEnum.Feedbacks,
          {
            doctor_id: data.id,
            server_id: data.server_id,
          },
        ],
        () =>
          getFeedbacks({
            doctor_id: data.id,
            server_id: data.server_id,
          }),
      );
      if (!isCSR)
        feedbackDataWithoutPagination = await queryClient.fetchQuery(
          [
            ServerStateKeysEnum.Feedbacks,
            {
              doctor_id: data.id,
              server_id: data.server_id,
              no_page_limit: true,
            },
          ],
          () =>
            getFeedbacks({
              doctor_id: data.id,
              server_id: data.server_id,
              no_page_limit: true,
            }),
        );
      useFeedbackDataStore.getState().setData(feedbackData?.result ?? []);
    } catch (error) {
      console.log(error);
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        query,
        slug: slugFormmated,
        initialFeedbackDate: useFeedbackDataStore.getState().data,
        feedbackDataWithoutPagination: feedbackDataWithoutPagination?.result ?? [],
      },
    };
  } catch (error) {
    console.dir(error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404)
        return {
          notFound: true,
        };
    }
    throw new TypeError(JSON.stringify(error));
  }
};

export default DoctorProfile;
