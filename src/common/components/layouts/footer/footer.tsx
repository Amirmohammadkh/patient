import AccordingMenu from '@/components/atom/accordingMenu/';
import Logo from '@/components/atom/logo';
import Text from '@/components/atom/text';
import Image from 'next/image';
import { footerForDoctors, footerForUsers, footerPaziresh24 } from './data/link';
import socials from './data/social.json';
import About from './logo/about';
import AboutMe from './logo/about-me';
import AboutUs from './logo/about-us';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-700 p-4 mt-14 ">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="grid grid-cols-12 grid-rows-1 gap-2 ">
          <div className="col-span-12 md:col-span-5">
            <div className="flex flex-col justify-center gap-2">
              <div className="flex flex-row gap-3 items-center justify-center md:justify-start">
                <Logo />
              </div>
              <div className="flex flex-col justify-center md:justify-start ">
                <Text as="p" className="mb-6  text-center md:text-start " fontWeight="medium" fontSize="sm">
                  تجربه مشاوره آنلاین و دریافت نوبت از بهترین پزشکان و بیمارستان‌های ایران
                </Text>
              </div>
              <ul className="flex flex-row justify-center gap-2 md:justify-start">
                {socials.map(social => {
                  return (
                    <li key={social.id}>
                      <a href={social.url} rel={social.rel} target={social.target} title={social.title}>
                        <Image src={social.src} alt={social.title} width={30} height={30} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="flex flex-wrap flex-col justify-center gap-2 md:flex-row md:justify-start">
              <div className="md:basis-[49%]">
                <AccordingMenu title={footerForUsers.title} items={footerForUsers.links} />
              </div>
              <div className="md:basis-[49%]">
                <AccordingMenu title={footerForDoctors.title} items={footerForDoctors.links} />
              </div>
              <div className="md:basis-[49%]">
                <AccordingMenu title={footerPaziresh24.title} items={footerPaziresh24.links} />
              </div>
              <div className="flex flex-col items-center justify-center mt-2 md:basis-[49%]">
                <div className="flex flex-row items-center justify-center">
                  <span className="inline-block w-20 h-20">
                    <a href="/home/about-us/">
                      <About />
                    </a>
                  </span>
                  <span className="inline-block w-20 h-20">
                    <a href="/home/about-us/">
                      <AboutUs />
                    </a>
                  </span>
                  <span className="inline-block w-20 h-20">
                    <a href="/home/about-us/">
                      <AboutMe />
                    </a>
                  </span>
                </div>
                <div className="max-w-lg text-sm">
                  <Text as="p" align="center">
                    تمامی حقوق مادی و معنوی این وب‌سایت، خدمات و محتوای مربوط به آن متعلق به شرکت سپهرسلامت می‌باشد
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
