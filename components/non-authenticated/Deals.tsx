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
        description="Lorem ipsum dolor, sit amet consectetur adipisicing"
        buttonText="Shop Now"
        bgColor="bg-[#42872F]"
        titleBgColor="bg-[#FFCC00]"
        buttonBgColor="bg-[#FFCC00]"
        imageSrc="/images/delivery-man.jpg"
      />
      <DealCard
        title="Organic Fruits"
        description="Lorem ipsum dolor, sit amet consectetur adipisicing"
        buttonText="Shop Now"
        bgColor="bg-[#FFCC00]"
        titleBgColor="bg-[#42872F]"
        buttonBgColor="bg-[#42872F] "
        imageSrc="/images/fruit-basket.jpg"
      />
    </div>
  );
}

export default Deals;
