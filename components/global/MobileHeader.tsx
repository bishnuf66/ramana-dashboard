"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoginModal from "../non-authenticated/LoginModal";
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  Search,
  LogIn,
  House,
} from "lucide-react";
import { useCart } from "../context/CartContext";

function MobileHeader() {
  const { getTotalItems } = useCart();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);
  const items = getTotalItems();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", searchQuery);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-2 bg-white text-black">
        <div className="flex items-center">
          <Link href="/">
            <Image
              className="h-12 w-12"
              src={"/images/fruit-store-logo.jpg"}
              alt="header-image"
              width={48}
              height={48}
            />
          </Link>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </div>
      </div>

      {/* Backdrop Overlay when Menu is Open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white text-black py-2 px-4 gap-4 flex-col flex items-start justify-start z-20">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <button onClick={() => setIsMenuOpen(false)}>
              <X className="w-6 h-6 text-black" />
            </button>
          </div>
          <div className="flex items-center">
            <Link href="/">
              <Image
                className="h-12 w-12"
                src={"/images/fruit-store-logo.jpg"}
                alt="header-image"
                width={48}
                height={48}
              />
            </Link>
          </div>
          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full mb-4 flex flex-row"
          >
            <input
              type="text"
              placeholder="Search for fruits..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />{" "}
            <span className="bg-[#42872F] w-10 h-10 flex items-center justify-center">
              {" "}
              <Search className="text-white" />
            </span>
          </form>
          <Link href="/" className="flex flex-row space-x-2 py-2">
            <span> Home</span>
            <House />
          </Link>

          <button
            className=" py-2 flex flex-row  space-x-2"
            onClick={handleOpenLoginModal}
          >
            <span> Log In</span>
            <LogIn />
          </button>
          <div className="flex space-x-2 py-2">
            <span>Favorite</span>
            <Heart className="w-6 h-6" />
          </div>
          <Link href="/cart" className="block py-2">
            <div className="flex items-center justify-center gap-1 relative">
              Cart <ShoppingCart className="w-6 h-6" />
              <span className="absolute bg-green-500 text-white -top-3 -right-3 rounded-full w-5 h-5 flex items-center justify-center">
                {items}
              </span>
            </div>
          </Link>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </div>
  );
}

export default MobileHeader;
