import { Mail } from "lucide-react";

function HomeBanner() {
  return (
    <div
      className="w-full h-[50vh] flex bg-cover bg-center flex-col"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80')" }}
    >
      <div className="items-start w-full sm:w-1/2 h-auto m-10 text-xl sm:text-5xl text-[#C7DBC1] text-left">
        Start Shopping at our fruit store
      </div>
      <div className="w-full h-full mb-4">
        <div className="flex justify-start items-center pt-10 sm:pt-20 pl-5 sm:pl-10">
          <div className="p-4 w-full sm:w-1/3 h-auto flex flex-col justify-start items-start rounded-sm">
            <div className="mb-4 text-[#C7DBC1] text-lg sm:text-xl">
              Get 50% off on your first order
            </div>
            <form action="">
              <div className="flex flex-col sm:flex-row items-center w-full">
                <span className="relative w-full sm:w-auto">
                  <input
                    type="search"
                    placeholder="Enter Your Email address"
                    className="rounded-l-md p-2 border border-gray-300 flex-grow relative h-10 w-full sm:w-56"
                  />
                  <span className="absolute right-0 top-1 h-10 w-10 flex items-center justify-center">
                    <Mail />
                  </span>
                </span>

                <button
                  type="submit"
                  className="rounded-r-md text-white p-2 w-full sm:w-35 h-10 mt-4 sm:mt-0 sm:ml-4"
                  style={{ backgroundColor: "#42872F" }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeBanner;



