import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface DealCardProps {
  title: string;
  description: string;
  buttonText: string;
  bgColor: string;
  titleBgColor: string;
  buttonBgColor: string;
  imageSrc: string;
}

const DealCard: React.FC<DealCardProps> = ({
  title,
  description,
  buttonText,
  bgColor,
  titleBgColor,
  buttonBgColor,
  imageSrc,
}) => {
  return (
    <div className={`w-full h-auto relative p-4 ${bgColor}`}>
      <div className="w-1/2 h-auto space-y-2 flex flex-col items-start justify-start md:m-10 ">
        <div className={`font-bold text-2xl p-2 ${titleBgColor} text-white`}>
          {title}
        </div>
        <div className="text-left pt-5 md:pt-10">{description}</div>
        <button
          className={`rounded-sm p-2 flex flex-row ${buttonBgColor} text-white`}
        >
          <span> {buttonText} </span>
          <ArrowRight />
        </button>
      </div>
      <Image
        src={imageSrc}
        alt="product"
        width={160}
        height={192}
        className="md:w-40 md:h-48 w-24 h-32 object-cover absolute bottom-8 right-4"
      />
    </div>
  );
};

function Deals() {
  return (
    <div className="w-full h-full text-black grid grid-cols-1 md:grid-cols-2 space-y-3 md:space-y-0 md:space-x-3 p-3">
      <DealCard
        title="Free Delivery"
        description="Free delivery for all bouquet orders above NPR 2000 in Kathmandu Valley"
        buttonText="Order Now"
        bgColor="bg-[#42872F]"
        titleBgColor="bg-[#FFCC00]"
        buttonBgColor="bg-[#FFCC00]"
        imageSrc="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
      />
      <DealCard
        title="Premium Bouquets"
        description="Handcrafted bouquets made with love by Ramana using fresh flowers"
        buttonText="Shop Now"
        bgColor="bg-[#FFCC00]"
        titleBgColor="bg-[#42872F]"
        buttonBgColor="bg-[#42872F] "
        imageSrc="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
      />
    </div>
  );
}

export default Deals;
