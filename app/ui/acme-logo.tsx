import Image from 'next/image';
export default function AcmeLogo() {
  return (
    <div>
     <Image
             src="/images/logo_2.png"
             width={250}
             height={90}
             className="logo-img"
             alt="My Gala Logo"
           />
           <br/>
      
    </div>
  );
}
